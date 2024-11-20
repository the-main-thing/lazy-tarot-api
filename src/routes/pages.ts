import { getPages, type Pages } from '../cms/pages/getPages.ts'
import type { Context } from '../createContext.ts'
import { notFoundResponse } from '../notFoundResponse.ts'
import { jsonResponse } from '../jsonResponse.ts'
import { log } from '../cms/utils/log.ts'
import { getItem, setItem } from '../db/cacheStorage.ts'

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
	const key = JSON.stringify(['getAllPages', language])
	let data: Pages | null = await getItem(key) as never
	if (!data) {
		data = await getPages({
			language,
			context,
		})
		await setItem(key, JSON.stringify(data))
	}
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
