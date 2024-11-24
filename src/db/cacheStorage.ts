import { eq } from 'drizzle-orm'

import { db } from './db'
import { cache } from './schema/index'

const STALE_TIME = 1000 * 60 * 60 * 1 // 1 hour

export async function getItem(key: string, staleTime = STALE_TIME) {
	try {
		const data = await db.query.cache.findFirst({ where: eq(cache.key, key) })
		if (!data) {
			return null
		}
		const { updatedAt } = data
		if (updatedAt + staleTime > Date.now()) {
			return data.value
		}
		await removeItem(key)
		return null
	} catch (error) {
		console.error(new Date(), 'Cannot getItem from cache\n', error)
		return null
	}
}

export async function setItem(key: string, value: string) {
	try {
		await db.insert(cache).values({
			key,
			value,
			updatedAt: Date.now(),
		}).onConflictDoUpdate({
			target: cache.key,
			set: { value, updatedAt: Date.now() }
		})
	} catch (error) {
		console.error(new Date(), 'Cannot setItem to cache\n', error)
		return
	}
}
export async function removeItem(key: string) {
	try {
		await db.delete(cache).where(eq(cache.key, key))
	} catch (error) {
		console.error(new Date(), 'Cannot removeItem from cache\n', error)
		return
	}
}
