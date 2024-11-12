import { z } from 'zod'
import { getPages } from '../api/pages/getPages.js'
import { publicProcedure } from '../trpc.js'


export const getAllPagesData = publicProcedure
	.input(
		z.object({
			language: z.string().optional(),
		}),
	)
	.query(async ({ input, ctx: context }) => {
		return getPages({
			language: input.language,
			context,
		})
	})
