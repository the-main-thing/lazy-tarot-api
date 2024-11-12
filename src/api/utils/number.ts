export function isNumber(value: unknown): value is number {
	return Number.isFinite(value)
}
export function isInteger(value: unknown): value is number {
	return Number.isInteger(value)
}
export function isFloat(value: unknown): value is number {
	return isNumber(value) && !isInteger(value)
}

export function parseNumber<TFallback>(
	value: unknown,
	fallback?: TFallback,
):
	| number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| (TFallback extends () => any ? ReturnType<TFallback> : TFallback) {
	if (isNumber(value)) {
		return value
	}

	const numeric = parseFloat(String(value))
	if (isNumber(numeric)) {
		return numeric
	}

	if (typeof fallback === 'function') {
		return fallback()
	}

	return fallback as never
}
/**
 * @param min number minimum value (inclusive)
 * @param max number maximum value (inclusive)
 */
export function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
