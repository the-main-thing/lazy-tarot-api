import { env } from './env'
import { log } from './cms/utils/log'
import { router } from './routes/router'
import { server as serverGlobal } from './server'
import { translationsWebsocketConfig } from './routes/translations'

const run = () => {
  const server = Bun.serve({
    port: env.PORT || 3000,
    fetch(request) {
      try {
        return router(request)
      } catch (error) {
        if (error instanceof Response) {
          return error
        }
        log.error(
          'Error handling request',
          request.method,
          request.url,
          '\n',
          error,
        )
        return new Response('Internal error', { status: 500 })
      }
    },
    websocket: translationsWebsocketConfig,
  })
  serverGlobal.set(server)
  return server
}

const server = run()

console.log(`Listening on http://${server.hostname}:${server.port}`)
