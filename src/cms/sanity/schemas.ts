export type Image = {
	asset: {
		_ref: string
	}
}

export type I18n = Array<{
	_key: string
	value: string
}>


export type I18nBlock = Array<{
	_key: string
	value: Record<PropertyKey, any>
}>
