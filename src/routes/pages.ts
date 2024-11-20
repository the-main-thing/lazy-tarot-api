import { getPages } from '../cms/pages/getPages.js'
import type { Context } from '../createContext.js'
import { notFoundResponse } from '../notFoundResponse.js'
import { jsonResponse } from '../jsonResponse.js'
import { log } from '../cms/utils/log.js'

const MAX_AGE = 60 * 60 * 4

export async function getAllPages(context: Context) {
	if (context.request.method.toUpperCase() !== 'GET') {
		throw notFoundResponse()
	}
	const url = new URL(context.request.url)
	const [_path, language, ...rest] = url.pathname.split('/').filter(Boolean)
	if (rest.length > 0) {
		throw notFoundResponse()
	}
	const data = await getPages({
		language,
		context,
	})
	const [response, error] = jsonResponse(data, {
		headers: {
			"Cache-Control": `public, max-age=${MAX_AGE}, stale-while-revalidate=${MAX_AGE}`,
		}
	})

	if (error) {
		log.error('getAllPges', error)
		throw new Response('Internal error', { status: 500 })
	}

	return response
}
