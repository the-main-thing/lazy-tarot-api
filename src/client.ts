import type { RouteData, RouteName } from './routes/router.ts'

export type Init = Pick<RequestInit, 'method' | 'headers' | 'body'>

export type MakeRequest = (url: string, init?: Init) => Promise<Response>

export type ClientResponse<TRouteName extends RouteName> = Promise<
  RouteData[TRouteName]
>

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

  public readonly mobileInit = async (): Promise<void> => {
    const url = this.apiRoot + '/0/mobile-init'
    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      const json = (await response.json()) as { key: string }
      if (!json.key) {
        throw new ApiClientError(
          '/0/mobile-init returned unexpected result',
          response,
          json,
        )
      }
      this.headers.set('x-api-key', json.key)
			return
    }
    throw new ApiClientError('/0/mobile-init returned non OK status', response)
  }

  public readonly getAllPages = async (
    language: string,
  ): ClientResponse<'/get-all-pages'> => {
    const url = this.apiRoot + `/get-all-pages/${language}`

    const response = await this.makeRequestFn(url, this.getRequestInit)
    if (response.status < 400) {
      return response.json() as never
    }
    throw new ApiClientError('/get-all-pages returned non OK status', response)
  }

  public readonly getCardsSet = async (
    language: string,
  ): ClientResponse<'/get-cards-set'> => {
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
  ): ClientResponse<'/get-card-by-id'> => {
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
  ): ClientResponse<'/get-random-card'> => {
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
