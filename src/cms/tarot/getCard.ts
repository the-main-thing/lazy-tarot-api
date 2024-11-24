import type { SanityClient } from '@sanity/client'

import type { CardContentQueryObject } from './cardContentQueryObject'
import { translateCard } from './translateCard'
import type { Context } from '../../createContext'
import { getItem, setItem } from '../../db/cacheStorage'

type Params = {
	language: string | undefined
	id: string
	context: Context
}

export const queryContent = async (
	client: SanityClient,
	id: Params['id'],
): Promise<
	| [data: CardContentQueryObject | null, error: null]
	| [data: null, error: unknown]
> => {
	try {
		const key = `*[_type=="tarotCard" && _id=="${id}"][0]`
		let data: CardContentQueryObject | null = await getItem(key).then((v) =>
			v ? JSON.parse(v) : null,
		)
		if (!data) {
			data = await client.fetch<CardContentQueryObject>(key)
			await setItem(key, JSON.stringify(data))
		}

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
