export function jsonResponse(data: unknown, init?: {
	headers?: Record<string, string>
	status?: number
	statusText?: string
}) {
	const options = init || {
		headers: {},
		status: 200,
	}
	options.headers = options.headers || {}
	options.headers['Content-Type'] = 'application/json'
	options.status = options.status || 200
	try {
		return [new Response(JSON.stringify(data), options), null] as const
	} catch (error) {
		return [null, error as Error] as const
	}
}
