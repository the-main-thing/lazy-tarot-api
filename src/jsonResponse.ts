import type { TypedResponse } from "./typedResponse.type.js" 

export function jsonResponse<TData>(
	data: TData,
	init?: ResponseInit,
): [TypedResponse<TData>, null] | [null, { error: unknown }] {
	try {
		return [Response.json(data, init) as TypedResponse<TData>, null] as const
	} catch (error) {
		return [null, { error }] as const
	}
}
