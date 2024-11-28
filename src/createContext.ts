import type { SanityClient } from '@sanity/client'

import { createClient } from './cms/sanity/sanityClient'

export function createContext(
  sanityStudioProjectId: string,
  request: Request,
): Context {
  const sanityClient = createClient(sanityStudioProjectId)

  return {
    request,
    sanity: {
      client: sanityClient,
    },
  }
}

export interface Context {
  request: Request
  sanity: {
    client: SanityClient
  }
}
