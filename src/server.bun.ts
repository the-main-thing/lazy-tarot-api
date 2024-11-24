import { env } from './env'
import { log } from './cms/utils/log'
import { router } from './routes/router'

const run = () => {
  return Bun.serve({
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
  })
}

const server = run()

console.log('Server running on port', server.port)
