import { pickRandomCard } from '@repo/core'
import type { Context } from '../types'

import { translateCard } from './translateCard.server'
import { queryContent } from './getCard'

type Params = {
	language: string | undefined
	prevPickedCards: Array<{
		id: string
		upsideDown: boolean
	}>
	context: Context
}

const queryAndPickACard = async ({
	context,
	prevPickedCards,
}: Pick<Params, 'context' | 'prevPickedCards'>) => {
	try {
		const { runQuery, q } = context.sanity
		const cardsIds = await runQuery(
			q('*').filter(`_type == "tarotCard"`).grab({
				_id: q.string(),
			})
		)
		if (!cardsIds || !cardsIds.length) {
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

		const card = await queryContent(context.sanity, id)

		return card as typeof card | null
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
