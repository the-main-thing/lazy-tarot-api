import type { I18nBlock, I18n, Image } from '../sanity/schemas.js'

export type Description = {
	fullDescription: I18nBlock,
	shortDescription: I18n,
}

export type Variant = {
	title: I18n,
	description: Description,
}

export type CardContentQueryObject = {
	_id: string,
	title: I18n,
	regular: Variant,
	upsideDown: Variant,
	image: Image,
}
