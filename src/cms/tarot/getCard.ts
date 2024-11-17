import type { SanityClient } from '@sanity/client'

import type { CardContentQueryObject } from './cardContentQueryObject.js'
import { translateCard } from './translateCard.js'
import type { Context } from '../../createContext.js'

type Params = {
	language: string | undefined
	id: string
	context: Context
}

export const queryContent = async (
	client: SanityClient,
	id: Params['id'],
): Promise<[data: CardContentQueryObject | null, error: null] | [data: null, error: unknown]> => {
	try {
		const data = await client.fetch<CardContentQueryObject>(
			`*[_type=="tarotCard" && _id=="${id}"][0]`
		)

		return [data, null]

	} catch (error) {
		return [null, error]
	}
}

export const getCardById = async ({ language, id, context }: Params) => {
	const [card, error] = await queryContent(context.sanity.client, id)

	if (error) {
		console.error(new Date(), 'Sanity query error', error)
	}

	return card
		? translateCard({
			card,
			language,
			context,
		})
		: null
}
