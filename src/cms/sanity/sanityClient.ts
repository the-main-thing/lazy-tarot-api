import {
	createClient as createSanityClient,
	type SanityClient,
} from '@sanity/client'
import { dataset, useCdn, apiVersion } from './constants.ts'

const clientCreator = () => {
	let client: SanityClient | null = null
	let project: string | null = null
	return (projectId: string): SanityClient => {
		if (project !== projectId) {
			client = createSanityClient({
				dataset,
				projectId,
				useCdn,
				apiVersion,
			})

			project = projectId

			return client
		}

		if (!client) {
			throw new Error('Project has been set, but client have not')
		}

		return client
	}
}

export const createClient = clientCreator()
