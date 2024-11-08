import { q } from 'groqd'
import { schemas } from '../sanity/schemas'

const descriptionSchema = q.object({
	fullDescription: schemas.i18nBlock,
	shortDescription: schemas.i18n,
})

const variantSchema = q.object({
	title: schemas.i18n,
	description: descriptionSchema,
})

export const cardContentQueryObject = {
	_id: q.string(),
	title: schemas.i18n,
	regular: variantSchema,
	upsideDown: variantSchema,
	image: schemas.image,
}

/* @typegen card */
export const card = cardContentQueryObject
