import { router } from './trpc.js'

import { getCardById, getCardsSet, getRandomCard } from './routes/tarot.js'
import { getAllPagesData } from './routes/pages.js'

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
