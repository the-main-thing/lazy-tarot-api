import { env } from './env.js'
import { createContext } from './createContext.js'
import { router } from './routes/router.js'

const run = () => {
	return Bun.serve({
		port: env.PORT || 3000,
		fetch(request) {
			const apiKey = request.headers.get('x-api-key')
			if (apiKey !== env.LAZY_TAROT_API_KEY) {
				return new Response(null, { status: 401 })
			}
			return router(createContext(env.SANITY_STUDIO_PROJECT_ID, request))
		},
	})
}

const server = run()

console.log('Server running on port', server.port)

