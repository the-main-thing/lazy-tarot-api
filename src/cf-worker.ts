import { createRequestHandler } from './createRequestHandler.js'
import { envSchema, type Env } from './env.js'

export default {
  fetch: async (
    request: Request,
    environmentVariables: Env,
  ): Promise<Response> => {
    const env = envSchema.parse(environmentVariables)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== env.LAZY_TAROT_API_KEY) {
      return new Response(null, { status: 401 })
    }
    return createRequestHandler(env)(request)
  },
}
