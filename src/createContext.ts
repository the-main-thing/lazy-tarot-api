import type { SanityClient } from '@sanity/client' 

import { createClient } from './api/sanity/sanityClient.js'


export function createContext(sanityStudioProjectId: string): Context {
	const sanityClient = createClient(sanityStudioProjectId)
	return {
		sanity: {
			client: sanityClient,
		},
	}
}

export interface Context {
	sanity: {
		client: SanityClient
	}
}

