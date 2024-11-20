import type { RouteData, RouteName } from './routes/router.js'

export type Init = Pick<RequestInit, 'method' | 'headers' | 'body'>

export type MakeRequest = (url: string, init?: Init) => Promise<Response>

export type ClientResponse<TRouteName extends RouteName> = Promise<
	RouteData[TRouteName]
>

export class ApiClientError extends Error {
	readonly isApiClientError = true
	response: Response
	constructor(message: string, response: Response) {
		super(message)
		this.response = response
	}
}

export class ApiClient {
	private readonly makeRequestFn: MakeRequest
	private readonly apiRoot: `http${string}`
	private readonly apiKey: string
	constructor(
		makeRequestFn: MakeRequest,
		apiRoot: `http${string}`,
		apiKey: string,
	) {
		this.makeRequestFn = makeRequestFn
		this.apiRoot = apiRoot
		this.apiKey = apiKey
	}

	private readonly headers = () => {
		return new Headers({
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'x-api-key': this.apiKey,
		})
	}

	public getAllPages = async (
		language: string,
	): ClientResponse<'/get-all-pages'> => {
		const url = new URL(`/get-all-pages/${language}`, this.apiRoot).href

		const response = await this.makeRequestFn(url, {
			method: 'GET',
			headers: this.headers(),
		})
		if (response.status < 400) {
			return response.json() as never
		}
		throw new ApiClientError('/get-all-pages returned non OK status', response)
	}

	public getCardsSet = async (
		language: string,
	): ClientResponse<'/get-cards-set'> => {
		const url = new URL(`/get-cards-set/${language}`, this.apiRoot).href

		const response = await this.makeRequestFn(url, {
			method: 'GET',
			headers: this.headers(),
		})
		if (response.status < 400) {
			return response.json() as never
		}
		throw new ApiClientError('/get-cards-set returned non OK status', response)
	}

	public getCardById = async (
		language: string,
		id: string,
	): ClientResponse<'/get-card-by-id'> => {
		const url = new URL(`/get-card-by-id/${language}/${id}`, this.apiRoot).href

		const response = await this.makeRequestFn(url, {
			method: 'GET',
			headers: this.headers(),
		})
		if (response.status < 400) {
			return response.json() as never
		}
		throw new ApiClientError('/get-card-by-id returned non OK status', response)
	}

	public getRandomCard = async (
		language: string,
		previouslyPickedCards: Array<{ id: string; upsideDown: boolean }>,
	): ClientResponse<'/get-random-card'> => {
		const url = new URL(`/get-random-card/${language}`, this.apiRoot).href

		const response = await this.makeRequestFn(url, {
			method: 'POST',
			headers: this.headers(),
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
