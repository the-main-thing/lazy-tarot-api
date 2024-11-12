import { z } from 'zod'

import { publicProcedure } from '../trpc.js'
import { getCardById as sanityGetCardById } from '../api/tarot/getCard.js'
import { getCardsSet as sanityGetCardsSet } from '../api/tarot/getCardsSet.js'
import { getRandomCard as sanityGetRandomCard } from '../api/tarot/getRandomCard.js'

export const getRandomCard = publicProcedure
	.input(
		z.object({
			language: z.string().optional(),
			prevPickedCards: z.array(
				z.object({ id: z.string(), upsideDown: z.boolean() }),
			),
		}),
	)
	.query(async ({ input, ctx: context }) => {
		return sanityGetRandomCard({
			language: undefined,
			...input,
			context,
		})
	})

export const getCardsSet = publicProcedure
	.input(
		z.object({
			language: z.string().optional(),
			slice: z.tuple([z.number(), z.number()]).optional(),
		}),
	)
	.query(async ({ input, ctx: context }) => {
		return sanityGetCardsSet({
			input,
			context,
		})
	})

export const getCardById = publicProcedure
	.input(
		z.object({
			language: z.string().optional(),
			id: z.string(),
		}),
	)
	.query(async ({ input, ctx: context }) => {
		return sanityGetCardById({
			language: input.language,
			id: input.id,
			context,
		})
	})
