import { randInt } from './number.ts'

const MAX_HISTORY_SIZE = 20
const MAX_ATTEMPTS = 5000 // to prevent infinite loop

type SomeArray<T> = Array<T> | ReadonlyArray<T>
type GetCardIdFromSetItem<TCard> = (card: TCard) => string

interface Props<TCard> {
	prevPickedCards: SomeArray<{
		id: string
		upsideDown: boolean
	}>
	cardsSet: SomeArray<TCard>
	getIdFromSetItem: GetCardIdFromSetItem<TCard>
}

const maxHistorySize = ({
	prevPickedCards,
	cardsSet,
}: Pick<Props<any>, 'cardsSet' | 'prevPickedCards'>): number => {
	return Math.min(
		Math.max(cardsSet.length - 1, 0),
		MAX_HISTORY_SIZE,
		prevPickedCards.length
	)
}

const getHistorySet = <TCard>({
	prevPickedCards,
	cardsSet,
	getIdFromSetItem,
}: Props<TCard>) => {
	const prevPickedIds = Object.fromEntries(
		prevPickedCards
			.slice(
				-1 *
					maxHistorySize({
						prevPickedCards,
						cardsSet,
					})
			)
			.map(entry => [entry.id, entry])
	)
	const validPickedCardsIds = new Set<string>()
	for (const card of cardsSet) {
		const id = getIdFromSetItem(card)
		const pickedCard = prevPickedIds[id]
		if (pickedCard) {
			validPickedCardsIds.add(id)
		}
	}

	return [
		validPickedCardsIds,
		prevPickedCards
			.slice(-1 * maxHistorySize({ prevPickedCards, cardsSet }))
			.filter(card => validPickedCardsIds.has(card.id)),
	] as const
}

const getUpsideDown = (prev: SomeArray<{ upsideDown: boolean }>) => {
	if (
		typeof prev.at(-1) !== 'undefined' &&
		prev.at(-1)?.upsideDown === prev.at(-2)?.upsideDown &&
		prev.at(-2)?.upsideDown === prev.at(-3)?.upsideDown
	) {
		return !prev.at(-1)?.upsideDown
	}

	return Math.random() - 0.1 > 0.5
}

export const pickRandomCard = <TCard>(props: Props<TCard>) => {
	const [prevPickedIds, nextPrevPickedCards] = getHistorySet(props)
	const { cardsSet, getIdFromSetItem } = props
	try {
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			const card = cardsSet.at(randInt(0, cardsSet.length - 1))
			if (!card) {
				throw new Error('pick random card error. index out of bounds')
			}
			const id = getIdFromSetItem(card)
			const upsideDown = getUpsideDown(props.prevPickedCards)
			if (!prevPickedIds.has(id)) {
				nextPrevPickedCards.push({ id, upsideDown })
				return [
					null,
					{
						id,
						upsideDown,
						prevPickedCards: nextPrevPickedCards,
					},
				] as const
			}
		}
		throw new Error('Too many attempts for picking next card')
	} catch (error) {
		return [error as Error, null] as const
	}
}
