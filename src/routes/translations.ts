import { isbot } from 'isbot'
import cookie from 'cookie'
import sanitizeHTML from 'sanitize-html'
import {
  getTranslations,
  addTranslation,
  importTranslations,
  upsertUser,
  authenticate,
  isValidSession,
  setSession,
} from '../db/translations'
import { env } from '../env'
import { log } from '../cms/utils/log'
import { server } from '../server'
import type { Context } from '../createContext'
import type { WebSocketHandler } from 'bun'

const cookieAge = 60 * 60 * 1
const TEN_MINUTES_MS = 1000 * 60 * 10

const sanitize = (input: unknown): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  return sanitizeHTML(input, {
    allowedTags: [],
  })
}

const sessionCookieKey =
  process.env.NODE_ENV === 'development' ? 'session' : '__Secure-Session'

const lockState = getLocksState()

const isValidSessionCookie = (cookieHeader: string | null) => {
  try {
    if (!cookieHeader) {
      return false
    }
    const login = cookie.parse(cookieHeader)?.[sessionCookieKey]
    if (!login || !isValidSession(login)) {
      return false
    }
    setSession(login, Date.now() + cookieAge * 1000)
    return true
  } catch {
    return false
  }
}

const serializeSessionCookie = (login: string) => {
  setSession(login, Date.now() + cookieAge * 1000)
  return cookie.serialize(sessionCookieKey, login, {
    maxAge: cookieAge,
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

const CORS = {
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Origin': env.TRANSLATIONS_HOST,
} satisfies HeadersInit

export const translationsRouter = async (
  request: Context['request'],
): Promise<Response | 'SHOULD_RETURN_UNDEFINED'> => {
  let response = await handleImport(request)
  if (response) {
    return response
  }
  response = await handleUpsertUser(request)
  if (response) {
    return response
  }
  response = await handleGetTranslations(request)
  if (response) {
    return response
  }
  response = await handleUpdate(request)
  if (response) {
    return response
  }
  if (isbot(request.headers.get('user-agent'))) {
    return new Response('Not found', { status: 404 })
  }
  const url = new URL(request.url)
  const cookieHeaderValue = request.headers.get('cookie')
  const authenticated = isValidSessionCookie(cookieHeaderValue)
  if (request.method === 'GET' && url.pathname === '/translations/api/status') {
    return authenticated
      ? new Response('ok', { status: 200, headers: CORS })
      : new Response('Unauthorized', { status: 401, headers: CORS })
  }

  if (request.method === 'POST' && url.pathname === '/translations/login') {
    const formData = await request.formData()
    const login = formData.get('login')
    const password = formData.get('password')
    if (
      !login ||
      !password ||
      typeof login !== 'string' ||
      typeof password !== 'string'
    ) {
      return new Response(null, { status: 400, headers: CORS })
    }
    const user = await authenticate(login, password)
    if (!user) {
      return new Response(null, { status: 400, headers: CORS })
    }

    return new Response(null, {
      status: 200,
      headers: {
        ...CORS,
        'Set-Cookie': serializeSessionCookie(login),
      },
    })
  }

  if (!authenticated) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  if (url.pathname === '/translations/api/ws') {
    if (request.headers.get('origin') !== env.TRANSLATIONS_HOST) {
      log.error(
        'Authenticated request from unexpected origin',
        request.headers.get('origin'),
      )
      return new Response('Unauthorized', { status: 401 })
    }
    const wsSession =
      cookie.parse(request.headers.get('cookie') || '')?.['WS_SESSION'] ||
      crypto.randomUUID()
    const success = server.get()?.upgrade(request, {
      headers: {
        ...CORS,
        'Set-Cookie': cookie.serialize('WS_SESSION', wsSession, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: cookieAge,
        }),
      },
      data: { wsSession },
    })
    if (success) {
      // Bun automatically returns a 101 Switching Protocols
      // if the upgrade succeeds
      return 'SHOULD_RETURN_UNDEFINED' as const
    }
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  return new Response(null, {
    status: 404,
  })
}
export const translationsWebsocketConfig: WebSocketHandler = {
  open: (ws) => {
    ws.subscribe('BROADCAST')
    const locks = {} as Record<string, string>
    for (const [key, [id]] of lockState.locks.entries()) {
      locks[key] = id
    }
    ws.send(
      JSON.stringify({
        type: 'init',
        locks,
      }),
    )
  },
  async message(ws, rawMessage) {
    try {
      const message = JSON.parse(rawMessage as string)
      switch (message.type) {
        case 'lock':
          if (lockState.lock(message.key, message.id)) {
            const response = JSON.stringify({
              type: 'lock',
              key: message.key,
              id: message.id,
            })
            server.get()?.publish('BROADCAST', response)
            return
          }
          ws.send(
            JSON.stringify({
              type: 'lock-denied',
              key: message.key,
              id: message.id,
            }),
          )
          return
        case 'release':
          if (lockState.release(message.key, message.id)) {
            const response = JSON.stringify({
              type: 'release',
              key: message.key,
            })
            server.get()?.publish('BROADCAST', response)
            return
          }
          ws.send(
            JSON.stringify({
              type: 'release-denied',
              key: message.key,
              id: message.id,
            }),
          )
          return
        case 'release-all':
          const released = lockState.releaseById(message.id)
          for (const key of released) {
            server
              .get()
              ?.publish('BROADCAST', JSON.stringify({ type: 'release', key }))
          }
          return
        default:
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid message type',
            }),
          )
          return
      }
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message
      ) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: error.message,
          }),
        )
        return
      }
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Internal Server Error',
        }),
      )
    }
  },
}

function getLocksState() {
  const locks = new Map<string, [string, number]>()
  setInterval(() => {
    const keysToRelease = [] as Array<string>
    for (const [key, [, expiresAt]] of locks.entries()) {
      if (expiresAt <= Date.now()) {
        keysToRelease.push(key)
        server
          .get()
          ?.publish('BROADCAST', JSON.stringify({ type: 'release', key }))
      }
    }
    for (const key of keysToRelease) {
      locks.delete(key)
    }
  }, TEN_MINUTES_MS)
  const lock = (key: string, id: string) => {
    const current = locks.get(key)
    if (current && current[0] === id) {
      current[1] = Date.now() + TEN_MINUTES_MS
      return true
    }
    if (!current) {
      locks.set(key, [id, Date.now() + TEN_MINUTES_MS])
      return true
    }

    if (current && current[1] <= Date.now()) {
      locks.set(key, [id, Date.now() + TEN_MINUTES_MS])
      return true
    }

    return false
  }

  const release = (key: string, id: string) => {
    const current = locks.get(key)
    if (current && current[0] === id) {
      locks.delete(key)
      return true
    }
    return !current
  }

  const releaseById = (id: string) => {
    const keysToRelease: Array<string> = []
    for (const [key, [userId]] of locks.entries()) {
      if (userId === id) {
        keysToRelease.push(key)
      }
    }
    for (const key of keysToRelease) {
      release(key, id)
    }

    return keysToRelease
  }

  return {
    locks,
    releaseById,
    lock,
    release,
  }
}

async function updateLocks() {
  const translations = await getTranslations()
  const locks: Record<string, string> = {}
  for (const [key, [id]] of lockState.locks.entries()) {
    if (key in translations) {
      locks[key] = id
      continue
    }
    lockState.release(key, id)
  }
  return locks
}

async function handleImport(request: Request) {
  const url = new URL(request.url)
  // /translations/api/importPath/:language
  const [translations, api, importPath, language, ...rest] = url.pathname
    .split('/')
    .filter(Boolean)
  if (
    translations === 'translations' &&
    api === 'api' &&
    importPath === 'import' &&
    language &&
    rest.length === 0 &&
    request.method === 'POST' &&
    request.headers.get('x-api-key') === env.AUTOMATION_API_KEY
  ) {
    try {
      const extracted = await request.json()
      const translations = await importTranslations(language, extracted)
      const locks = await updateLocks()
      server.get()?.publish(
        'BROADCAST',
        JSON.stringify({
          type: 'IMPORT',
          locks,
          translations,
        }),
      )
      return Response.json(translations)
    } catch (error) {
      try {
        const locks = await updateLocks()
        server.get()?.publish(
          'BROADCAST',
          JSON.stringify({
            type: 'IMPORT',
            locks,
          }),
        )
      } catch {
        // do nothing
      }
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message
      ) {
        console.error(`Error importing translations: ${error.message}`)
        return new Response(error.message, { status: 500 })
      }
      console.error('Unknown error importing translations', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

async function handleGetTranslations(request: Request) {
  const url = new URL(request.url)
  if (url.pathname === '/translations/api/get' && request.method === 'GET') {
    const cookieHeaderValue = request.headers.get('cookie')
    if (!isValidSessionCookie(cookieHeaderValue)) {
      return new Response('Unauthorized', { status: 401 })
    }
    const translations = await getTranslations()
    return Response.json(translations, { headers: CORS })
  }
}

async function handleUpdate(request: Request) {
  const url = new URL(request.url)
  const cookieHeaderValue = request.headers.get('cookie')
  const authenticated =
    isValidSessionCookie(cookieHeaderValue) ||
    request.headers.get('x-api-key') !== env.AUTOMATION_API_KEY
  if (!authenticated) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (
    url.pathname === '/translations/api/update' &&
    request.method === 'POST'
  ) {
    try {
      const formData = await request.formData()
      const message = sanitize(formData.get('message')).trim()
      if (!message) {
        return new Response('Message cannot be empty', {
          status: 400,
        })
      }
      const lang = sanitize(formData.get('lang'))
      const key = sanitize(formData.get('key'))
      await addTranslation(key, {
        lang,
        message,
      })
      const locks = await updateLocks()

      server.get()?.publish(
        'BROADCAST',
        JSON.stringify({
          type: 'UPDATE',
          key,
          lang,
          message,
          locks,
        }),
      )
      return new Response('Translation updated', { status: 200, headers: CORS })
    } catch (error) {
      try {
        const locks = await updateLocks()

        server.get()?.publish(
          'BROADCAST',
          JSON.stringify({
            type: 'init',
            locks,
          }),
        )
      } catch {
        // do nothing
      }
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message
      ) {
        return new Response(error.message, { status: 500 })
      }
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

async function handleUpsertUser(request: Request) {
  const url = new URL(request.url)
  if (url.pathname !== '/translations/api/upsert_user') {
    return
  }

  if (request.method !== 'POST') {
    return new Response(null, { status: 400 })
  }

  if (request.headers.get('x-api-key') !== env.AUTOMATION_API_KEY) {
    return new Response(null, { status: 401 })
  }

  try {
    const { login, password } = await request.json()
    if (
      typeof login !== 'string' ||
      typeof password !== 'string' ||
      !login ||
      !password
    ) {
      return new Response(null, { status: 400 })
    }
    await upsertUser(login, password)
    return new Response(null, { status: 200 })
  } catch {
    return new Response(null, { status: 500 })
  }
}
