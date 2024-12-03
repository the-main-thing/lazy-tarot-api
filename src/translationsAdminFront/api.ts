import { createApiClient } from '../client'
export { ApiClientError } from '../client'

export const api = createApiClient({
  apiRoot: window.location.origin as never,
  apiKey: undefined,
  makeRequest: fetch,
})
