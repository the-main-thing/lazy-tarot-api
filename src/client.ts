import type { RouteData, RouteName } from './routes/router'

export type Init = Pick<RequestInit, 'method' | 'headers' | 'body'>

export type MakeRequest = (url: string, init?: Init) => Promise<Response>

export type ClientResponses = {
  [routeName in RouteName]: Promise<RouteData[routeName]>
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

export class ApiClient {
  private readonly makeRequestFn: MakeRequest
  private readonly apiRoot: string
  private readonly headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })
  private readonly getRequestInit: RequestInit = {
    method: 'GET',
    headers: this.headers,
  }

  constructor(
    makeRequestFn: MakeRequest,
    /** http(s)://.... */
    apiRoot: string,
    apiKey: string | undefined | null,
  ) {
    this.makeRequestFn = makeRequestFn
    this.apiRoot = new URL(apiRoot).href
    if (this.apiRoot.endsWith('/')) {
      this.apiRoot = this.apiRoot.slice(0, -1)
    }
    if (apiKey) {
      this.headers.set('x-api-key', apiKey)
    }
  }

  public readonly mobileInit = async (): Promise<
    Omit<RouteData['/mobile/0/init'], 'key'>
  > => {
    const url = this.apiRoot + '/mobile/0/init'
    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      const json = await (response.json() as ClientResponses['/mobile/0/init'])
      if (!json.key) {
        throw new ApiClientError(
          '/0/mobile-init returned unexpected result',
          response,
          json,
        )
      }
      this.headers.set('x-api-key', json.key)
      const { key: _, ...data } = json
      return data
    }
    throw new ApiClientError('/mobile/0/init returned non OK status', response)
  }

  public readonly getAllPages = async (
    language: string,
  ): ClientResponses['/get-all-pages'] => {
    const url = this.apiRoot + `/get-all-pages/${language}`

    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError('/get-all-pages returned non OK status', response)
  }

  public readonly reportError = async (
    client: 'mobile',
    data: unknown,
  ): ClientResponses['/mobile/0/error'] => {
    const url = this.apiRoot + `/${client}/0/error`
    const response = await this.makeRequestFn(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError(
      `/${client}/0/error request returned non OK status`,
      response,
    )
  }

  public readonly getCardsSet = async (
    language: string,
  ): ClientResponses['/get-cards-set'] => {
    const url = this.apiRoot + `/get-cards-set/${language}`

    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError('/get-cards-set returned non OK status', response)
  }

  public readonly getCardById = async (
    language: string,
    id: string,
  ): ClientResponses['/get-card-by-id'] => {
    const url = this.apiRoot + `/get-card-by-id/${language}/${id}`
    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError('/get-card-by-id returned non OK status', response)
  }

  public readonly getRandomCard = async (
    language: string,
    previouslyPickedCards: Array<{ id: string; upsideDown: boolean }>,
  ): ClientResponses['/get-random-card'] => {
    const url = this.apiRoot + `/get-random-card/${language}`

    const response = await this.makeRequestFn(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        prevPickedCards: previouslyPickedCards,
      }),
    })
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError('/get-card-by-id returned non OK status', response)
  }
}
