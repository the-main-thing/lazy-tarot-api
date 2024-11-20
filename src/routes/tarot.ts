import { z } from 'zod'

import { getCardById as sanityGetCardById } from '../cms/tarot/getCard.js'
import { getCardsSet as sanityGetCardsSet } from '../cms/tarot/getCardsSet.js'
import { getRandomCard as sanityGetRandomCard } from '../cms/tarot/getRandomCard.js'
import type { Context } from '../createContext.js'
import { notFoundResponse } from '../notFoundResponse.js'
import { jsonResponse } from '../jsonResponse.js'
import { log } from '../cms/utils/log.js'

const getRandomCardInputSchema = z.object({
	prevPickedCards: z.array(
		z.object({ id: z.string(), upsideDown: z.boolean() }),
	),
})



export const getRandomCard = async (context: Context) => {
	if (context.request.method.toUpperCase() !== 'POST') {
		throw notFoundResponse()
	}
	const url = new URL(context.request.url)
	const [_path, language, ...rest] = url.pathname.split('/').filter(Boolean)
	if (rest.length > 0) {
		throw notFoundResponse()
	}
	try {
		const body = await context.request.json()
		const { prevPickedCards } = getRandomCardInputSchema.parse(body)

		const data = await sanityGetRandomCard({
			language,
			prevPickedCards: prevPickedCards.slice(-90),
			context,
		})
		const [response, error] = jsonResponse(data, {
			headers: {
				"Cache-Control": 'no-store',
			}
		})
		if (error) {
			log.error('getRandomCard', error)
			throw new Response('Internal error', { status: 500 })
		}

		return response
	} catch (error) {
		log.error('getRandomCard\n', error)
		throw new Response('', {
			status: 400
		})
	}
}


const MAX_AGE = 60 * 60 * 1

export const getCardsSet = async (context: Context) => {
	if (context.request.method.toUpperCase() !== 'GET') {
		throw notFoundResponse()
	}
	const url = new URL(context.request.url)
	const [_path, language, ...rest] = url.pathname.split('/').filter(Boolean)
	if (rest.length > 0) {
		throw notFoundResponse()
	}
	const data = await sanityGetCardsSet(
		language,
		context,
	)
	const [response, error] = jsonResponse(data, {
		headers: {
			"Cache-Control": `public, max-age=${MAX_AGE}, stale-while-revalidate=${MAX_AGE}`,
		}
	})
	if (error) {
		log.error('getCardsSet', error)
		throw new Response('Internal error', { status: 500 })
	}
	return response

}

export const getCardById = async (
	context: Context
) => {
	if (context.request.method.toUpperCase() !== 'GET') {
		throw notFoundResponse()
	}
	const url = new URL(context.request.url)
	const [_path, language, id, ...rest] = url.pathname.split('/').filter(Boolean)
	if (rest.length > 0) {
		throw notFoundResponse()
	}
	if (!id) {
		throw notFoundResponse()
	}
	const data = await sanityGetCardById({
		language,
		id,
		context,
	})

	const [response, error] = jsonResponse(data, {
		headers: {
			"Cache-Control": `public, max-age=${MAX_AGE}, stale-while-revalidate=${MAX_AGE}`,
		}
	})
	if (error) {
		log.error('getCardById', error)
		throw new Response('Internal error', { status: 500 })
	}
	return response

}
