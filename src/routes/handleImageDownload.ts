const CACHE_CONTROL_MAX_AGE = 60 * 60 * 24 * 365

const changeUrl = (requestUrl: string): string => {
  const url = new URL(requestUrl)
  return `https://cdn.sanity.io${url.pathname}${url.search}${url.hash}`
}

export const handleImageDownload = async (request: Request) => {
  const response = await fetch(changeUrl(request.url))
  response.headers.set(
    'Cache-Control',
    `public, max-age=${CACHE_CONTROL_MAX_AGE}`,
  )
  return response
}
