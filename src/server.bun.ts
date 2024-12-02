import { env } from './env'
import { log } from './cms/utils/log'
import { router } from './routes/router'
import { server as serverGlobal } from './server'
import { translationsWebsocketConfig } from './routes/translations'

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
      'Content-Type, Authorization, x-api-key',
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
        return addCors(request, await router(request))
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
