import type { TypedResponse } from './typedResponse.type'

export function jsonResponse<TData>(
	data: TData,
	init?: ResponseInit,
): [TypedResponse<TData>, null] | [null, { error: unknown }] {
	if (typeof data === 'string') {
		let headers = new Headers(init?.headers)
		headers.set('Content-Type', 'application/json;charset=utf-8')
		return [new Response(data, {
			status: 200,
			...init,
			headers,
		}), null] as never
	}
	try {
		return [Response.json(data, init) as TypedResponse<TData>, null] as const
	} catch (error) {
		return [null, { error }] as const
	}
}
