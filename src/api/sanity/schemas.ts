import { q } from 'groqd'

export const image = q.object({
	/* @typegen image */
	asset: q.object({
		_ref: q.string(),
	}),
})

export const i18n = q.array(
	/* @typegen i18n */
	q.object({
		_key: q.string(),
		value: q.string(),
	}),
)
export const i18nBlock = q.array(
	/* @typegen i18nBlock */
	q.object({
		_key: q.string(),
		value: q.contentBlocks(),
	}),
)

export const schemas = {
	image,
	i18n,
	i18nBlock,
} as const
