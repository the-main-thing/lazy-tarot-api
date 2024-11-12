import { translateCard, type TranslatedCard } from './translateCard.js'

import type { Context } from '../../createContext.js'
import type { CardContentQueryObject } from './cardContentQueryObject.js'


type Params = {
	input: {
		language?: string | undefined
	}
	context: {
		sanity: {
			client: Context['sanity']['client']
		}
	}
}

export const queryContent = async ({
	context,
}: Params) => {

	try {
		const data = await context.sanity.client.fetch<Array<CardContentQueryObject> | null>('*[_type=="tarotCard"]')
		return [data, null] as const
	} catch (error) {
		return [null, error] as const
	}

}

export const getCardsSet = async (params: Params) => {
	const [data, error] = await queryContent(params)
	if (!data || data.length < 1) {
		throw new Error('No content for cards has been acuired')
	}

	if (error) {
		console.error(new Date(), 'Error getting cards set', error)
	}

	const translated = data.map(card =>
		translateCard({
			language: params.input.language,
			card,
			context: params.context,
		})
	)


	return translated as NonEmptyArray<TranslatedCard>

}
