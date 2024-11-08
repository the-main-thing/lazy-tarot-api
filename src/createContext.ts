import { getRunQuery } from './api/sanity/runQuery'
import { createClient } from './api/sanity/sanityClient'

type Params = {
	sanityStudioProjectId: string
}

export async function createContext({ sanityStudioProjectId }: Params) {
	const sanityClient = createClient(sanityStudioProjectId)
	return {
		sanity: {
			client: sanityClient,
			runQuery: getRunQuery(sanityClient),
		},
	}
}
export type Context = Awaited<ReturnType<typeof createContext>>
