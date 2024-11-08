import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createContext } from './createContext'

import { appRouter } from './router'

export const createRequestHandler =
  (env: { SANITY_STUDIO_PROJECT_ID: string }) => (request: Request) => {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: () =>
        createContext({
          sanityStudioProjectId: env.SANITY_STUDIO_PROJECT_ID,
        }),
    })
  }
