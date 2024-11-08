import { z } from 'zod'
import { tarot } from '@repo/api'

import { publicProcedure } from '../trpc'

import type { Card, CardsSet } from '../types'

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
    return tarot.getRandomCard({
      language: undefined,
      ...input,
      context,
    }) as Promise<Card>
  })

export const getCardsSet = publicProcedure
  .input(
    z.object({
      language: z.string().optional(),
      slice: z.tuple([z.number(), z.number()]).optional(),
    }),
  )
  .query(async ({ input, ctx: context }) => {
    return tarot.getCardsSet({
      input,
      context,
    }) as Promise<CardsSet>
  })

export const getCardById = publicProcedure
  .input(
    z.object({
      language: z.string().optional(),
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx: context }) => {
    return tarot.getCardById({
      language: input.language,
      id: input.id,
      context,
    }) as Promise<Card>
  })
