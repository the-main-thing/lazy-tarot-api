import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createContext } from './createContext.js'

import { appRouter } from './router.js'

export const createRequestHandler =
	(env: { SANITY_STUDIO_PROJECT_ID: string }) => (request: Request) => {
		return fetchRequestHandler({
			endpoint: '/trpc',
			req: request,
			router: appRouter,
			createContext: () =>
				createContext(env.SANITY_STUDIO_PROJECT_ID),
		})
	}
