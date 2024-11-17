export function jsonResponse(data: unknown, init?: {
	headers?: Record<string, string>
	status?: number
	statusText?: string
}) {
	const options = init || {
		headers: undefined,
		status: 200,
	}
	options.headers = options.headers || undefined
	options.status = options.status || 200
	try {
		return [Response.json(data, options), null] as const
	} catch (error) {
		return [null, error as Error] as const
	}
}
