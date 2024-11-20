import { pickRandomCard } from './pickRandomCard.ts'

const cardsSet = Array(100)
	.fill('')
	.map((_, index) => ({
		id: String(index),
	}))
let prevPickedCards = Array(5)
	.fill('')
	.map((_, index) => ({
		id: String(index),
		upsideDown: index % 2 === 0,
	}))

const results = Object.fromEntries(
	cardsSet.map(card => [
		card.id,
		{
			picked: 0,
			upsideDown: 0,
			index: -1,
		},
	])
)

const consecutiveUpsideDowns: Array<number | null> = [null]
let consecutiveUpsideDownsIndex = 0
const consecutiveIds: Array<number | null> = [null]
let consecutiveIdsIndex = 0
let lastId = ''
let lastUpsideDown: boolean | null = null

let state: any

try {
	for (let i = 0; i < 10000; i++) {
		const [error, result] = pickRandomCard({
			cardsSet,
			prevPickedCards,
			getIdFromSetItem: ({ id }) => id,
		})
		if (error) {
			console.error('Error:', error)
			process.exit(1)
		}
		results[result.id]!.picked++
		results[result.id]!.upsideDown += result.upsideDown ? 1 : 0
		results[result.id]!.index = i
		prevPickedCards = result.prevPickedCards
		if (lastUpsideDown === result.upsideDown) {
			consecutiveUpsideDowns[consecutiveUpsideDownsIndex] =
				(consecutiveUpsideDowns[consecutiveUpsideDownsIndex] || 0) + 1
		} else {
			if (consecutiveUpsideDowns[consecutiveUpsideDownsIndex] !== null) {
				if (consecutiveUpsideDowns[consecutiveUpsideDownsIndex]! > 3) {
					consecutiveUpsideDowns[consecutiveUpsideDownsIndex] = null
				} else {
					consecutiveUpsideDowns.push(null)
					consecutiveUpsideDownsIndex += 1
				}
			}
			lastUpsideDown = result.upsideDown
		}

		if (lastId === result.id) {
			consecutiveIds[consecutiveIdsIndex] =
				(consecutiveIds[consecutiveIdsIndex] || 0) + 1
			throw result
		} else {
			if (consecutiveIds[consecutiveIdsIndex] !== null) {
				consecutiveIds.push(null)
				consecutiveIdsIndex += 1
			}
			lastId = result.id
		}
	}
} catch (result) {
	state = result
}

const upsideDownsTotal = consecutiveUpsideDowns.filter(v => v && v > 3).length
const idsTotal = consecutiveIds.filter(Boolean).length

const report = `
State: ${state ? JSON.stringify(state, null, 2) : 'Ok'}

Consecutive upside-downs:
max: ${Math.max(...(consecutiveUpsideDowns.filter(v => v && v > 3) as Array<number>))}
total: ${upsideDownsTotal}

Consecutive ids: 
max: ${Math.max(...(consecutiveIds.filter(Boolean) as Array<number>))}
total: ${idsTotal}


Results list:
${JSON.stringify(
	Object.entries(results)
		.filter(([_k, v]) => {
			return v.picked > 0
		})
		.map(([id, v]) => {
			return {
				id,
				...v,
			}
		})
		.sort((a, b) => b.index - a.index),
	null,
	2
)}
`

if (upsideDownsTotal > 0 || idsTotal > 0) {
	console.error(report)
	process.exit(1)
}

