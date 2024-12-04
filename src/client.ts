import { randInt } from './cms/utils/number'
import type { RouteData, RouteName, RouteResponses } from './routes/router'
import type { TypedResponse } from './typedResponse.type'

export type Init = Pick<RequestInit, 'method' | 'headers' | 'body'>

export type MakeRequest = (url: string, init?: Init) => Promise<Response>

export type ClientResponses = {
  [routeName in RouteName]: Promise<RouteData[routeName]>
}

type ExtractParams<T extends string> = T extends `${string}/:${infer P}`
  ? P extends `${infer U}/${infer Rest}`
    ? U | ExtractParams<Rest>
    : P
  : never

type GetParams<TPath extends RouteName> = {
  [Key in ExtractParams<TPath>]: string
}

export class ApiClientError extends Error {
  readonly isApiClientError = true
  readonly response: Response
  readonly json: Record<PropertyKey, unknown> | undefined = undefined
  constructor(
    message: string,
    response: Response,
    json?: Record<PropertyKey, unknown>,
  ) {
    super(message)
    this.response = response
    this.json = json
  }
}

type CreateApiClientParams = {
  apiRoot: `http${'s' | ''}://${string}`
  apiKey: string | undefined
  makeRequest: MakeRequest
}

type FetchJsonResponse<TPath extends RouteName> =
  NonNullable<RouteResponses[TPath]> extends TypedResponse<any>
    ? NonNullable<RouteResponses[TPath]>
    : never

const injectParams = <TPath extends RouteName>(
  routeName: TPath,
  params: GetParams<TPath>,
): string => {
  return (
    '/' +
    routeName
      .split('/')
      .map((segment) => {
        if (!segment.startsWith(':')) {
          return segment
        }
        return params[segment.slice(1) as keyof typeof params] || ''
      })
      .filter(Boolean)
      .join('/')
  )
}

export const createApiClient = ({
  apiRoot,
  apiKey,
  makeRequest,
}: CreateApiClientParams) => {
  let ready = Boolean(apiKey)
  apiRoot = apiRoot.endsWith('/')
    ? (apiRoot.slice(0, -1) as typeof apiRoot)
    : apiRoot
  // validate url
  void new URL(apiRoot)

  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })

  let initPromise: Promise<FetchJsonResponse<'/api/v1/init'>> | null = null

  const fetch = async <TPath extends RouteName>(
    routeName: TPath,
    params: GetParams<TPath>,
    init?: Init,
  ): Promise<Response> => {
    if (!ready && !initPromise) {
      let status = 1000
      while (status >= 400) {
        initPromise = makeRequest(apiRoot + '/api/v1/init', {
          method: 'GET',
          headers,
        })
        const response = await initPromise
        void response
          .text()
          .then(() => void 0)
          .catch(() => void 0)
        status = response.status
        if (status >= 400) {
          await new Promise<void>((resolve) => {
            setTimeout(
              () => {
                resolve()
              },
              randInt(1000, 10000),
            )
          })
        }
      }
      ready = true
      initPromise = null
    }
    const response = await makeRequest(
      apiRoot + injectParams(routeName, params),
      init,
    )
    if (response.status >= 400) {
      throw new ApiClientError(
        `Request to "${apiRoot + injectParams(routeName, params)}" returned an error status code: "${response.status}"`,
        response,
      )
    }
    return response
  }

  const fetchJson = async <TPath extends RouteName>(
    routeName: TPath,
    params: GetParams<TPath>,
    init?: Init,
  ): Promise<FetchJsonResponse<TPath>> => {
    return fetch(routeName, params, init) as never
  }

  const setApiKey = (newApiKey?: string) => {
    const key = newApiKey || apiKey
    if (key) {
      headers.set('x-api-key', key)
    }
  }

  setApiKey(apiKey)

  const getRequestInit: Init = {
    method: 'GET',
    headers,
  }

  const init = async () => {
    const promise = initPromise || fetchJson('/api/v1/init', getRequestInit)
    return await promise.then((r) => r.json())
  }

  const getAllPages = async (language: string) => {
    const response = await fetchJson(
      '/api/v1/get-all-pages/:language',
      { language },
      getRequestInit,
    )
    return await response.json()
  }

  const reportError = async (data: unknown) => {
    const response = await fetchJson('/api/v1/mobile/error', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })
    return response.json()
  }

  const getCardsSet = async (language: string) => {
    const response = await fetchJson(
      '/api/v1/get-cards-set/:language',
      { language },
      getRequestInit,
    )
    return response.json()
  }

  const getCardById = async (
    params: GetParams<'/api/v1/get-card-by-id/:language/:id'>,
  ) => {
    return await fetchJson(
      '/api/v1/get-card-by-id/:language/:id',
      params,
      getRequestInit,
    ).then((r) => r.json())
  }

  const getRandomCard = async (
    language: string,
    previouslyPickedCards: Array<{ id: string; upsideDown: boolean }>,
  ) => {
    return await fetchJson(
      '/api/v1/get-random-card/:language',
      { language },
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          prevPickedCards: previouslyPickedCards,
        }),
      },
    ).then((response) => response.json())
  }

  const getTranslations = async () => {
    return await fetchJson('/api/v1/translations/get', {}, getRequestInit).then(
      (r) => r.json(),
    )
  }

  const updateTranslations = async (formData: FormData) => {
    const formDataHeaders = new Headers(headers)
    formDataHeaders.set('Content-Type', 'application/x-www-form-urlencoded')
    return await fetch(
      '/api/v1/translations/update',
      {},
      {
        method: 'POST',
        headers: formDataHeaders,
        body: formData,
      },
    )
  }

  const getTranslationsStatus = async () => {
    return await fetch('/api/v1/translations/status', {}, getRequestInit)
  }

  const translationsLogin = async (formData: FormData) => {
    const formDataHeaders = new Headers(headers)
    formDataHeaders.set('Content-Type', 'application/x-www-form-urlencoded')
    return await fetch(
      '/login',
      {},
      {
        method: 'POST',
        headers: formDataHeaders,
        body: formData,
      },
    )
  }

  const translationsWsEndpoint = apiRoot + '/api/v1/translations/ws'

  const getApiStatus = async () => {
    try {
      await fetch('/api/v1/status', {}, getRequestInit)
      return 'server-up'
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.response.status >= 400 && error.response.status < 500) {
          return 'client-out-of-date'
        }
        return 'server-is-down'
      }
      throw error
    }
  }

  const importTranslations = async ({
    language,
    extracted,
  }: {
    language: string
    extracted: string
  }) => {
    return await fetchJson(
      '/api/v1/translations/import/:language',
      { language },
      {
        method: 'POST',
        headers,
        body: extracted,
      },
    ).then((r) => r.json())
  }

  return {
    init,
    getAllPages,
    getCardsSet,
    getCardById,
    getRandomCard,
    getTranslations,
    updateTranslations,
    importTranslations,
    getTranslationsStatus,
    translationsLogin,
    reportError,
    translationsWsEndpoint,
    getApiStatus,
    setApiKey,
  }
}
