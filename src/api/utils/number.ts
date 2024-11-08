export const isNumber = (value: unknown): value is number =>
	Number.isFinite(value)
export const isInteger = (value: unknown): value is number =>
	Number.isInteger(value)
export const isFloat = (value: unknown): value is number =>
	isNumber(value) && !isInteger(value)

export const parseNumber = <TFallback>(
	value: unknown,
	fallback?: TFallback,
):
	| number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| (TFallback extends () => any ? ReturnType<TFallback> : TFallback) => {
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
