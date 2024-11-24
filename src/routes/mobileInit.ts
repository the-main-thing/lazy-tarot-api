import { SUPPORTED_LANGUAGES, defaultLanguage } from '../cms/sanity/constants'
import { env } from '../env'
import { notFoundResponse } from '../notFoundResponse'

export const mobileInit = (request: Request) => {
  if (request.method.toUpperCase() === 'GET') {
    return Response.json({
      key: env.MOBILE_CLIENT_API_KEY,
      SUPPORTED_LANGUAGES,
      defaultLanguage,
    })
  }

  throw notFoundResponse()
}
export const mobileInitMatch = (url: URL) => {
  const [version, mobileInit, ...rest] = url.pathname.split('/').filter(Boolean)
  return version === '0' && mobileInit === 'mobile-init' && !rest.length
}
