import { router } from './trpc'

import { getCardById, getCardsSet, getRandomCard } from './routes/tarot'
import { getAllPagesData } from './routes/pages'

export const appRouter = router({
	public: {
		tarot: {
			getCardById,
			getCardsSet,
			getRandomCard,
		},
		pages: { getAllPagesData },
	},
})

export type AppRouter = typeof appRouter
