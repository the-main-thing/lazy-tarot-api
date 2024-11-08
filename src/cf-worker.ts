import { createRequestHandler } from './createRequestHandler'
import { envSchema, type Env } from './env'

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
