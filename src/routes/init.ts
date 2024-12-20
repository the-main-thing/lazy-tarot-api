import { SUPPORTED_LANGUAGES, defaultLanguage } from '../cms/sanity/constants'
import { notFoundResponse } from '../notFoundResponse'
import { jsonResponse } from '../jsonResponse'
import { log } from '../cms/utils/log'
import type { Context } from '../createContext'
import { session } from './session'

export const init = (context: Context) => {
  if (context.request.method.toUpperCase() === 'GET') {
    const [response, error] = jsonResponse(
      {
        SUPPORTED_LANGUAGES,
        defaultLanguage,
      },
      {
        headers: !session.isValid(context.request.headers.get('cookie'))
          ? {
              'Set-Cookie': session.create(),
            }
          : undefined,
      },
    )
    if (!response || error) {
      throw (
        error ||
        (() => {
          log.error('init: error during creation of jsonResponse')
          return new Response('Internal error', {
            status: 500,
          })
        })()
      )
    }
    return Promise.resolve(response)
  }

  throw notFoundResponse()
}
