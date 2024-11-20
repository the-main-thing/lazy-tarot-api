import { env } from './env.ts'
import { createContext } from './createContext.ts'
import { router } from './routes/router.ts'
import { log } from './cms/utils/log.ts'
import { notFoundResponse } from './notFoundResponse.ts'

const isRouteName = (value: string): value is keyof typeof router => value in router

const run = () => {
	return Bun.serve({
		port: env.PORT || 3000,
		fetch(request) {
			const apiKey = request.headers.get('x-api-key')
			if (apiKey !== env.LAZY_TAROT_API_KEY) {
				return new Response(null, { status: 401 })
			}
			try {
				let [routeName] = new URL(request.url).pathname.split('/').filter(Boolean)
				routeName = `/${routeName}`
				if (!isRouteName(routeName)) {
					throw notFoundResponse()
				}
				return router[routeName](
					createContext(env.SANITY_STUDIO_PROJECT_ID, request),
				)
			} catch (maybeResponse) {
				if (maybeResponse instanceof Response) {
					return maybeResponse
				}
				log.error(
					'Error handling',
					request.method,
					request.url,
					'\n',
					maybeResponse,
				)
				return new Response('Internal error', { status: 500 })
			}
		},
	})
}

const server = run()

console.log('Server running on port', server.port)
