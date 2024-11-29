import { db } from './db'
import { SUPPORTED_LANGUAGES } from '../cms/sanity/constants'
import { eq } from 'drizzle-orm'
import { translationsContent, translationsAdmins } from './schema'

const TRANSLATIONS_KEY = 'translations' as const

export interface Extracted {
  [key: string]: {
    defaultMessage: string
    description?: string
  }
}

export interface Translation {
  lang: string
  message: string
}

export interface Translations {
  [key: string]: TranslationRecord
}

class TranslationRecord {
  description: string
  translations: Array<Translation>

  constructor(existingTranslationString: string | undefined | null) {
    if (existingTranslationString) {
      try {
        const { description, translations } = JSON.parse(
          existingTranslationString,
        )
        this.description = description
        this.translations = translations
      } catch {
        // ignore
      }
    }

    this.description = ''
    this.translations = SUPPORTED_LANGUAGES.map((lang) => ({
      lang,
      message: '',
    }))
  }
}

const findAndReplaceOrPush = <T>(
  array: Array<T>,
  predicate: (item: T) => boolean,
  replacement: (current: T | undefined) => T,
) => {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i]!)) {
      array[i] = replacement(array[i])
      return array
    }
  }
  array.push(replacement(undefined))
  return array
}

const getTranslationsCache = () => {
  let translations: Translations | null = null
  let timeout: ReturnType<typeof setTimeout> | null = null
  const scheduleGC = () => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(
      () => {
        translations = null
        timeout = null
      },
      1000 * 60 * 10,
    )
  }
  const getTranslations = async () => {
    if (!translations) {
      const translationsString = await db.query.translationsContent
        .findFirst({
          where: eq(translationsContent.key, TRANSLATIONS_KEY),
        })
        .then((data) => {
          return data?.value
        })
      if (!translationsString) {
        translations = {}
        return translations
      }
      translations = JSON.parse(translationsString) as Translations
    }

    scheduleGC()

    return translations
  }

  const addTranslation = async (key: string, translation: Translation) => {
    const translations = await getTranslations()
    if (!translations[key]) {
      throw new Error(`Key "${key}" not found`)
    }
    findAndReplaceOrPush(
      translations[key].translations,
      ({ lang }) => translation.lang === lang,
      () => translation,
    )
    const value = JSON.stringify(translations)
    await db
      .insert(translationsContent)
      .values({
        key: TRANSLATIONS_KEY,
        value,
      })
      .onConflictDoUpdate({
        target: translationsContent.key,
        set: {
          value,
        },
      })

    scheduleGC()
  }

  const importTranslations = async (lang: string, extracted: Extracted) => {
    const translations = await getTranslations()
    for (const [key, { defaultMessage, description }] of Object.entries(
      extracted,
    )) {
      const translation = translations[key] || new TranslationRecord(null)
      translation.description = description || ''
      findAndReplaceOrPush(
        translation.translations,
        (translation) => translation.lang === lang,
        (current) => {
          if (current) {
            current.message = defaultMessage
            return current
          }
          return {
            lang,
            message: defaultMessage,
          }
        },
      )
      translations[key] = translation
    }
    for (const key of Object.keys(translations)) {
      if (key in extracted) {
        continue
      }
      translations[key] = undefined as never
    }

    const value = JSON.stringify(translations)
    await db
      .insert(translationsContent)
      .values({
        key: TRANSLATIONS_KEY,
        value,
      })
      .onConflictDoUpdate({
        target: translationsContent.key,
        set: {
          value,
        },
      })

    scheduleGC()
    return translations
  }

  return {
    getTranslations,
    addTranslation,
    importTranslations,
  }
}

export const { getTranslations, addTranslation, importTranslations } =
  getTranslationsCache()

export const authenticate = async (login: string, password: string) => {
  if (!login || !password) {
    return null
  }
  const user = await db.query.translationsAdmins.findFirst({
    where: eq(translationsAdmins.login, login),
  })
  if (!user) {
    return null
  }
  const correctPassword = await Bun.password.verify(password, user.passwordHash)
  if (!correctPassword) {
    return null
  }
  user.lastLogin = Date.now()
  await db
    .update(translationsAdmins)
    .set({ lastLogin: user.lastLogin })
    .where(eq(translationsAdmins.login, user.login))

  return user
}

export const upsertUser = async (login: string, password: string) => {
  const passwordHash = await Bun.password.hash(password)

  return db
    .insert(translationsAdmins)
    .values({ login, passwordHash, lastLogin: 0 })
    .onConflictDoUpdate({
      target: translationsAdmins.login,
      set: {
        passwordHash,
      },
    })
}

const clearSessions = (sessionsMap: Map<string, number>) => {
  let toBeDeleted: Array<string> = []
  for (const [login, expiresAt] of sessionsMap) {
    if (Date.now() >= expiresAt) {
      toBeDeleted.push(login)
    }
  }
  for (const login of toBeDeleted) {
    sessionsMap.delete(login)
  }
}

const createSessions = () => {
  const sessions = new Map<
    string,
    [expiresAt: number, timeout: ReturnType<typeof setTimeout>]
  >()
  const isValidSession = (login: string) => {
    const expiresAt = sessions.get(login)?.at(0) as number | undefined
    return Boolean(expiresAt && Date.now() < expiresAt)
  }
  const setSession = (login: string, expiresAt: number) => {
    const current = sessions.get(login)
    if (current) {
      clearTimeout(current[1])
    }
    sessions.set(login, [
      expiresAt,
      setTimeout(
        (sessions) => clearSessions(sessions),
        expiresAt + 100 - Date.now(),
        sessions,
      ),
    ])
  }

  return { isValidSession, setSession }
}

export const { isValidSession, setSession } = createSessions()
