import {
	createClient as createSanityClient,
	type SanityClient,
} from '@sanity/client'
import { dataset, useCdn, apiVersion } from './constants.js'

export const createClient = (projectId: string): SanityClient =>
	createSanityClient({
		dataset,
		projectId,
		useCdn,
		apiVersion,
	})
