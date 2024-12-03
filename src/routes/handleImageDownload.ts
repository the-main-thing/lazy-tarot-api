const CACHE_CONTROL_MAX_AGE = 60 * 60 * 24 * 365

export const handleImageDownload = async (request: Request) => {
  const response = await fetch(new URL(request.url, 'https://cdn.sanity.io/'))
  response.headers.set(
    'Cache-Control',
    `public, max-age=${CACHE_CONTROL_MAX_AGE}`,
  )
  return response
}
