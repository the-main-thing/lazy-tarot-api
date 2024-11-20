import { pickRandomCard } from '../utils/pickRandomCard.ts'
import type { Context } from '../../createContext.ts'

import { translateCard } from './translateCard.ts'
import { queryContent } from './getCard.ts'
import { getItem, setItem } from '../../db/cacheStorage.ts'

type Params = {
	language: string | undefined
	prevPickedCards: Array<{
		id: string
		upsideDown: boolean
	}>
	context: Context
}

async function queryIds(
	client: Context['sanity']['client'],
): Promise<[data: Array<string>, error: null] | [data: null, error: unknown]> {
	try {
		const key = `*[_type=="tarotCard"]._id`
		let data: Array<string> | null = await getItem(key).then((value) =>
			value ? JSON.parse(value) : null,
		)
		if (!data) {
			data = await client.fetch<Array<string>>(key)
			await setItem(key, JSON.stringify(data))
		}

		return [data || [], null]
	} catch (error) {
		return [null, error]
	}
}

const queryAndPickACard = async ({
	context,
	prevPickedCards,
}: Pick<Params, 'context' | 'prevPickedCards'>) => {
	try {
		const [cardsIds, errorGettingCardsIds] = await queryIds(
			context.sanity.client,
		)
		if (!cardsIds || !cardsIds.length || errorGettingCardsIds) {
			console.error(new Date(), 'Error getting cards ids', errorGettingCardsIds)
			return null
		}

		let id = cardsIds[0]!
		const [_error, output] = pickRandomCard({
			cardsSet: cardsIds,
			prevPickedCards,
			getIdFromSetItem: (id) => id,
		})

		if (output) {
			id = output.id
		}

		const [card, errorGettingCard] = await queryContent(
			context.sanity.client,
			id,
		)
		if (!card || errorGettingCard) {
			console.error(new Date(), 'Error getting card by id', errorGettingCard)
			if (!errorGettingCard) {
				throw new Error(
					'Picked id from list of cards, but getting a card by id returns null without error',
				)
			}
		}

		return card
	} catch (error) {
		console.error('SANITY_ERROR', error)
		throw error
	}
}

export const getRandomCard = async (params: Params) => {
	const card = await queryAndPickACard(params)

	if (!card) {
		throw new Error(`Can't pick up a card. Seems like cards set is empty.`)
	}

	return translateCard({
		language: params.language,
		context: params.context,
		card,
	})
}
