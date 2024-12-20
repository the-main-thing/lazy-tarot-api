import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { TranslationRecord, WsFromServer } from './types'
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { TranslationItem } from './components/TranslationItem'
import { listenWs, sendWs } from './utils'
import { Label } from './components/ui/label'
import { Switch } from './components/ui/switch'
import { api, ApiClientError } from './api'

const id = crypto.randomUUID()

function App() {
  const { data: loggedIn, isLoading } = useQuery({
    queryKey: ['loggedIn'],
    queryFn: async () => {
      try {
        const response = await api.getTranslationsStatus()
        return response.status === 200
      } catch (error) {
        if (error instanceof ApiClientError) {
          return error.response.status === 200
        }
        throw error
      }
    },
  })

  useEffect(() => {
    if (!isLoading && !loggedIn) {
      window.location.href = new URL('/login', window.location.origin).href
    }
  }, [isLoading, loggedIn])

  const { data: translations, error } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const translations = await api.getTranslations()
      return Object.entries(translations) as Array<[string, TranslationRecord]>
    },
    enabled: !isLoading && loggedIn,
  })

  const queryClient = useQueryClient()
  const onUpdate = useCallback(
    (message: Extract<WsFromServer, { type: 'UPDATE' }>) => {
      const translations = queryClient.getQueryData<
        Array<[string, TranslationRecord]>
      >(['translations'])
      if (!translations) {
        queryClient.invalidateQueries({ queryKey: ['translations'] })
        return
      }
      const updated = Array(translations.length)
      for (let i = 0; i < translations.length; i++) {
        if (translations[i]![0] !== message.key) {
          updated[i] = translations[i]!
        }
        const record = translations[i]![1]!
        const messages = Array(record.translations.length)
        for (let j = 0; j < record.translations.length; j++) {
          if (record.translations[j]!.lang !== message.lang) {
            messages[j] = record.translations[j]!
          } else {
            messages[j] = {
              ...record.translations[j],
              message: message.message,
            }
          }
        }
      }
      queryClient.setQueryData(['translations'], updated)
    },
    [queryClient],
  )

  const onImport = useCallback(
    (message: Extract<WsFromServer, { type: 'IMPORT' }>) => {
      queryClient.setQueryData<typeof translations>(
        ['translations'],
        Object.entries(message.translations),
      )
    },
    [queryClient],
  )

  const [ws, setWs] = useState<null | WebSocket>(null)
  const [lockedKeys, setLockedKeys] = useState<{
    [key: string]: string
  }>({})

  useEffect(() => {
    if (!ws) {
      return
    }
    const keepAlive = Object.entries(lockedKeys).filter(([, userId]) => {
      return id === userId
    })
    const interval = setInterval(
      () => {
        for (const [key] of keepAlive) {
          sendWs(ws, {
            type: 'lock',
            key,
            id,
          })
        }
      },
      1000 * 60 * 3,
    )

    return () => clearInterval(interval)
  }, [lockedKeys, ws])

  useEffect(() => {
    const ws = new WebSocket(api.translationsWsEndpoint)
    setWs(ws)

    const stopListening = listenWs(ws, (message) => {
      switch (message.type) {
        case 'lock':
          setLockedKeys((current) => ({
            ...current,
            [message.key]: message.id,
          }))
          return
        case 'release':
          setLockedKeys((current) => {
            const { [message.key]: _, ...rest } = current
            return rest
          })
          return
        case 'lock-denied':
          setLockedKeys((current) => {
            if (current[message.key] === message.id) {
              const { [message.key]: _, ...rest } = current
              return rest
            }
            return current
          })
          return
        case 'init':
          setLockedKeys(message.locks)
          return
        case 'UPDATE':
          onUpdate(message)
          return
        case 'IMPORT':
          onImport(message)
          setLockedKeys(message.locks)
          return
        case 'error':
          console.error('Server error', message.message)
          return
        default:
          return
      }
    })

    const beforeUnload = () => {
      sendWs(ws, { type: 'release-all', id })
      ws.close()
    }
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      stopListening()
      window.removeEventListener('beforeunload', beforeUnload)
      ws.close()
    }
  }, [queryClient, onUpdate, onImport])

  const lock = useCallback(
    ({ key, id }: { key: string; id: string }) => {
      if (!ws) {
        return
      }
      setLockedKeys((current) => {
        if (current[key] && current[key] !== id) {
          return current
        }
        return {
          ...current,
          [key]: id,
        }
      })
      sendWs(ws, {
        type: 'lock',
        key,
        id,
      })
    },
    [ws],
  )

  const release = useCallback(
    ({ key, id }: { key: string; id: string }) => {
      if (!ws) {
        return
      }
      setLockedKeys((current) => {
        if (current[key] && current[key] !== id) {
          return current
        }
        const { [key]: _, ...rest } = current
        return rest
      })
      sendWs(ws, {
        type: 'release',
        key,
        id,
      })
    },
    [ws],
  )

  const [filterTranslated, setFilterTranslated] = useState(true)
  const filteredTranslations = useMemo(() => {
    if (!filterTranslated || !translations) {
      return translations
    }
    return translations.filter(([_, { translations: records }]) => {
      return records.some(({ message }) => !message)
    })
  }, [filterTranslated, translations])

  const content = error ? (
    <>
      <h1>Ошибка при загрузке переводов. Скажи Павлушке об этом</h1>
    </>
  ) : (
    <div className="w-2/3">
      {!filteredTranslations ? (
        <p>Загрузка переводов...</p>
      ) : (
        <div className="flex flex-col gap-8">
          <Label>
            <div className="mb-2">Скрыть переведённые</div>
            <Switch
              checked={filterTranslated}
              onCheckedChange={() => setFilterTranslated((current) => !current)}
            />
          </Label>
          {filteredTranslations.map(
            ([key, { description, translations: messages }]) => {
              const locked = !!lockedKeys[key] && lockedKeys[key] !== id
              return (
                <Card
                  key={key}
                  className={
                    locked
                      ? 'outline outline-2 outline-offset-2 outline-cyan-500'
                      : ''
                  }
                >
                  <CardHeader>
                    <CardTitle>
                      {messages.find(({ message }) => message)?.message || null}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul>
                      {messages.map((record) => {
                        return (
                          <li key={key + record.lang}>
                            <TranslationItem
                              translationKey={key}
                              id={id}
                              lang={record.lang}
                              message={record.message}
                              onLock={lock}
                              onRelease={release}
                              disabled={locked}
                              ws={ws}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )
            },
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex w-screen h-screen justify-center p-16">{content}</div>
  )
}

export default App
