import { getCardById } from './getCard'
import { getCardsSet } from './getCardsSet'
import { getRandomCard } from './getRandomCard'

export const tarot = {
	getCardById,
	getCardsSet,
	getRandomCard,
} as const
