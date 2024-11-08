import { z } from 'zod'
import { pages } from '@repo/api'
import { publicProcedure } from '../trpc'
import { BREAKPOINTS } from '@repo/core'

import {
  RootLayoutContent,
  IndexPageContent,
  TarotReadingPageContent,
  ManifestoPageContent,
  AboutUsPageContent,
} from '../types'

interface PagesData {
  rootLayoutContent: RootLayoutContent
  indexPageContent: IndexPageContent
  tarotReadingPageContent: TarotReadingPageContent<typeof BREAKPOINTS>
  manifestoPageContent: ManifestoPageContent
  aboutUsPageContent: AboutUsPageContent<typeof BREAKPOINTS>
}

export const getAllPagesData = publicProcedure
  .input(
    z.object({
      language: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx: context }) => {
    return pages.getPages({
      breakpoints: BREAKPOINTS,
      language: input.language,
      context,
    }) as Promise<PagesData>
  })
