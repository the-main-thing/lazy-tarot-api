import { translateCard, type TranslatedCard } from './translateCard.ts'

import type { Context } from '../../createContext.ts'
import type { CardContentQueryObject } from './cardContentQueryObject.ts'


type Params = [
	language: string | undefined,
	context: {
		sanity: {
			client: Context['sanity']['client']
		}
	}]

export const queryContent = async (
	context: Params[1]) => {

	try {
		const data = await context.sanity.client.fetch<Array<CardContentQueryObject> | null>('*[_type=="tarotCard"]')
		return [data, null] as const
	} catch (error) {
		return [null, error] as const
	}

}

export const getCardsSet = async (language: Params[0], context: Params[1]) => {
	const [data, error] = await queryContent(context)
	if (!data || data.length < 1) {
		throw new Error('No content for cards has been acuired')
	}

	if (error) {
		console.error(new Date(), 'Error getting cards set', error)
	}

	const translated = data.map(card =>
		translateCard({
			language,
			card,
			context,
		})
	)


	return translated as NonEmptyArray<TranslatedCard>

}
