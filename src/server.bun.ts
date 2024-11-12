import { createRequestHandler } from './createRequestHandler.js'
import { envSchema } from './env.js'

const run = () => {
	const env = envSchema.parse(process.env)
	return Bun.serve({
		port: process.env.PORT || 3000,
		fetch: async (request) => {
			const apiKey = request.headers.get('x-api-key')
			if (apiKey !== env.LAZY_TAROT_API_KEY) {
				return new Response(null, { status: 401 })
			}
			return createRequestHandler(env)(request)
		},
	})
}

run()

