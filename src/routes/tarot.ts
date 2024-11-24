import { z } from 'zod'

import { getCardById as sanityGetCardById } from '../cms/tarot/getCard'
import { getCardsSet as sanityGetCardsSet } from '../cms/tarot/getCardsSet'
import { getRandomCard as sanityGetRandomCard } from '../cms/tarot/getRandomCard'
import type { Context } from '../createContext'
import { notFoundResponse } from '../notFoundResponse'
import { jsonResponse } from '../jsonResponse'
import { log } from '../cms/utils/log'
import { getItem, setItem } from '../db/cacheStorage'
import type { TypedResponse } from '../typedResponse.type'

type CardsSet = Awaited<ReturnType<typeof sanityGetCardsSet>>

const getRandomCardInputSchema = z.object({
	prevPickedCards: z.array(
		z.object({ id: z.string(), upsideDown: z.boolean() }),
	),
})

export const getRandomCard = async (
	context: Context,
): Promise<TypedResponse<CardsSet[number]>> => {
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
				'Cache-Control': 'no-store',
			},
		})
		if (error) {
			log.error('getRandomCard', error)
			throw new Response('Internal error', { status: 500 })
		}

		return response
	} catch (error) {
		log.error('getRandomCard\n', error)
		throw new Response('', {
			status: 400,
		})
	}
}

const MAX_AGE = 60 * 60 * 1

export const getCardsSet = async (
	context: Context,
): Promise<TypedResponse<CardsSet>> => {
	if (context.request.method.toUpperCase() !== 'GET') {
		throw notFoundResponse()
	}
	const url = new URL(context.request.url)
	const [_path, language, ...rest] = url.pathname.split('/').filter(Boolean)
	if (rest.length > 0) {
		throw notFoundResponse()
	}
	const key = JSON.stringify(['getCardsSet', language])
	let data: CardsSet | null = (await getItem(key)) as never
	if (!data) {
		data = await sanityGetCardsSet(language, context)
		data = JSON.stringify(data) as never
		await setItem(key, data)
	}

	const [response, error] = jsonResponse(data, {
		headers: {
			'Cache-Control': `public, max-age=${MAX_AGE}, stale-while-revalidate=${MAX_AGE}`,
		},
	})
	if (error) {
		log.error('getCardsSet', error)
		throw new Response('Internal error', { status: 500 })
	}
	return response
}

export const getCardById = async (
	context: Context,
): Promise<TypedResponse<CardsSet[number]>> => {
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
	const key = JSON.stringify(['getCardById', language, id])
	let data: CardsSet[number] | null = (await getItem(key)) as never
	if (!data) {
		data = await sanityGetCardById({
			language,
			id,
			context,
		})
		data = JSON.stringify(data) as never
		await setItem(key, data)
	}

	const [response, error] = jsonResponse(data, {
		headers: {
			'Cache-Control': `public, max-age=${MAX_AGE}, stale-while-revalidate=${MAX_AGE}`,
		},
	})
	if (error) {
		log.error('getCardById', error)
		throw new Response('Internal error', { status: 500 })
	}
	return response
}
