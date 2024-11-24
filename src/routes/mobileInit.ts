import { SUPPORTED_LANGUAGES, defaultLanguage } from '../cms/sanity/constants'
import { env } from '../env'
import { notFoundResponse } from '../notFoundResponse'
import { jsonResponse } from '../jsonResponse'
import { log } from '../cms/utils/log'
import type { Context } from '../createContext'

export const mobileInit = (context: Context) => {
  if (context.request.method.toUpperCase() === 'GET') {
    const [response, error] = jsonResponse({
      key: env.MOBILE_CLIENT_API_KEY,
      SUPPORTED_LANGUAGES,
      defaultLanguage,
    })
    if (!response || error) {
      throw (
        error ||
        (() => {
          log.error('mobileInit: error during creation of jsonResponse')
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
export const mobileInitMatch = (url: URL) => {
  const [version, mobileInit, ...rest] = url.pathname.split('/').filter(Boolean)
  return version === '0' && mobileInit === 'mobile-init' && !rest.length
}
