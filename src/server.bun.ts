import { env } from './env'
import { log } from './cms/utils/log'
import { router } from './routes/router'
import { server as serverGlobal } from './server'
import { translationsWebsocketConfig } from './routes/translations'
import { UPGRADE_CONNECTION_RESPONSE } from './routes/constants'

const allowedOrigins = ['capacitor://localhost', 'ionic://localhost']

const addCors = (request: Request, response: Response) => {
  const origin = new URL(
    request.headers.get('origin') ||
      'http://this-is-definately-not-allowed.com',
  ).origin
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-api-key, cookie',
    )
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Transfer-Encoding', 'chunked')
  }
  return response
}

const run = () => {
  const server = Bun.serve({
    port: env.PORT || 3000,
    async fetch(request) {
      try {
        let response = await router(request)
        if (response === UPGRADE_CONNECTION_RESPONSE) {
          return undefined
        }
        if (!(response instanceof Response)) {
          response = new Response(null, { status: 404 })
        }
        return addCors(request, response)
      } catch (error) {
        if (error instanceof Response) {
          return addCors(request, error)
        }
        log.error(
          'Error handling request',
          request.method,
          request.url,
          '\n',
          error,
        )
        return addCors(request, new Response('Internal error', { status: 500 }))
      }
    },
    websocket: translationsWebsocketConfig,
  })
  serverGlobal.set(server)
  return server
}

const server = run()

console.log(`Listening on http://${server.hostname}:${server.port}`)
