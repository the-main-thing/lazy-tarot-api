import { makeSafeQueryRunner } from 'groqd'
import { SanityClient } from '@sanity/client'

export const getRunQuery = (client: SanityClient) =>
	makeSafeQueryRunner((query) => {
		return client.fetch(query)
	})
