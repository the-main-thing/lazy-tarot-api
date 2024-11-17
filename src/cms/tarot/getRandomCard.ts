import { pickRandomCard } from '../utils/pickRandomCard.js'
import type { Context } from '../../createContext.js'

import { translateCard } from './translateCard.js'
import { queryContent } from './getCard.js'
import type { CardContentQueryObject } from './cardContentQueryObject.js'

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
): Promise<[data: Array<CardContentQueryObject>, error: null] | [data: null, error: unknown]> {
	try {
		const data = await client.fetch<Array<CardContentQueryObject>>(
			`*[_type=="tarotCard"]._id`
		)

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

		const [cardsIds, errorGettingCardsIds] = await queryIds(context.sanity.client)
		if (!cardsIds || !cardsIds.length || errorGettingCardsIds) {
			console.error(new Date(), 'Error getting cards ids', errorGettingCardsIds)
			return null
		}

		let id = cardsIds[0]!._id
		const [_, output] = pickRandomCard({
			cardsSet: cardsIds,
			prevPickedCards,
			getIdFromSetItem: card => card._id,
		})

		if (output) {
			id = output.id
		}

		const [card, errorGettingCard] = await queryContent(context.sanity.client, id)
		if (!card || errorGettingCard) {
			console.error(new Date(), 'Error getting card by id', errorGettingCard)
			if (!errorGettingCard) {
				throw new Error('Picked id from list of cards, but getting a card by id returns null without error')
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
