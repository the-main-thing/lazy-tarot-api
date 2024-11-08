import { BREAKPOINTS } from '@repo/core'

import type { Context } from '../types'

type Params = {
	language?: string
	breakpoints: Record<number, number>
	context: Context
}

const getSanityContent = async ({
	q,
	schemas,
	runQuery,
}: Params['context']['sanity']) => {
	const query = q('').grab({
		rootLayoutContent: q('*')
			.filterByType('rootLayout')
			.grab({
				_id: q.string(),
				manifestoLinkTitle: schemas.i18n,
				tarotReadingLinkTitle: schemas.i18n,
				ogData: q.array(
					q.object({
						property: q.string(),
						content: schemas.i18n,
					})
				),
			})
			.slice(0),
		indexPageContent: q('*')
			.filterByType('indexPage')
			.grab({
				_id: q.string(),
				title: schemas.i18n,
				description: schemas.i18n,
				headerTitle: schemas.i18nBlock,
				headerDescription: schemas.i18nBlock,
			})
			.slice(0),
		tarotReadingPageContent: q('*')
			.filterByType('tarotReadingPage')
			.grab({
				_id: q.string(),
				headerTitle: schemas.i18nBlock,
				pickedCardTitle: schemas.i18nBlock,
				formDescription: schemas.i18nBlock,
				cardDescriptionHeaderText: schemas.i18n,
				submitButtonLabel: schemas.i18n,
				cardBackImage: schemas.image,
				pickNextCardButtonLabel: schemas.i18n,
			})
			.slice(0),
		manifestoPageContent: q('*')
			.filter('_type == "manifestoPage"')
			.grab({
				_id: q.string(),
				content: schemas.i18nBlock,
				header: schemas.i18nBlock,
				headerImage: schemas.image,
				contentImage: schemas.image,
			})
			.slice(0),
		aboutUsPageContent: q('*')
			.filter('_type == "aboutUsPage"')
			.grab({
				_id: q.string(),
				header: q.object({
					teamTitle: schemas.i18n,
					pageTitle: schemas.i18n,
				}),
				image: schemas.image,
				social: q.array(
					q.object({
						title: schemas.i18n,
						urlTitle: schemas.i18n,
						url: q.string(),
					})
				),
			})
			.slice(0),
	})

	const content = await runQuery(query)

	return content
}

const translate = (
	{ language, context }: Pick<Params, 'language' | 'context'>,
	{
		rootLayoutContent,
		indexPageContent,
		tarotReadingPageContent,
		manifestoPageContent,
		aboutUsPageContent,
	}: Awaited<ReturnType<typeof getSanityContent>>
) => {
	const { client, getTranslated, getImagesSet } = context.sanity

	return {
		rootLayoutContent: {
			manifestoLinkTitle: getTranslated(
				rootLayoutContent.manifestoLinkTitle,
				language
			),
			tarotReadingLinkTitle: getTranslated(
				rootLayoutContent.tarotReadingLinkTitle,
				language
			),
			ogData: rootLayoutContent.ogData.map(({ property, content }) => ({
				property,
				content: getTranslated(content, language),
			})),
		},
		indexPageContent: {
			title: getTranslated(indexPageContent.title, language),
			description: getTranslated(indexPageContent.description, language),
			headerTitle: getTranslated(indexPageContent.headerTitle, language),
			headerDescription: getTranslated(
				indexPageContent.headerDescription,
				language
			),
		},
		tarotReadingPageContent: {
			headerTitle: getTranslated(
				tarotReadingPageContent.headerTitle,
				language
			),
			pickedCardTitle: getTranslated(
				tarotReadingPageContent.pickedCardTitle,
				language
			),
			formDescription: getTranslated(
				tarotReadingPageContent.formDescription,
				language
			),
			cardDescriptionHeaderText: getTranslated(
				tarotReadingPageContent.cardDescriptionHeaderText,
				language
			),
			submitButtonLabel: getTranslated(
				tarotReadingPageContent.submitButtonLabel,
				language
			),
			cardBackImage: getImagesSet({
				client,
				image: tarotReadingPageContent.cardBackImage,
				breakpoints: BREAKPOINTS,
			}),
			pickNextCardButtonLabel: getTranslated(
				tarotReadingPageContent.pickNextCardButtonLabel,
				language
			),
		},
		manifestoPageContent: {
			header: getTranslated(manifestoPageContent.header, language),
			content: getTranslated(manifestoPageContent.content, language),
			headerImage: getImagesSet({
				client,
				format: 'png',
				image: manifestoPageContent.headerImage,
				breakpoints: Object.keys(BREAKPOINTS).reduce(
					(acc, key) => {
						acc[key as keyof typeof BREAKPOINTS] = 700

						return acc
					},
					{} as {
						[key in keyof typeof BREAKPOINTS]: 700
					}
				),
			}),
			contentImage: getImagesSet({
				client,
				image: manifestoPageContent.contentImage,
				breakpoints: BREAKPOINTS,
			}),
		},
		aboutUsPageContent: {
			id: aboutUsPageContent._id,
			header: {
				teamTitle: getTranslated(
					aboutUsPageContent.header.teamTitle,
					language
				),
				pageTitle: getTranslated(
					aboutUsPageContent.header.pageTitle,
					language
				),
			},
			image: getImagesSet({
				client,
				image: aboutUsPageContent.image,
				breakpoints: BREAKPOINTS,
			}),
			social: aboutUsPageContent.social.map(link => ({
				title: getTranslated(link.title, language),
				urlTitle: getTranslated(link.urlTitle, language),
				url: link.url,
			})),
		},
	}
}

export const getPages = (props: Params) => {
	return getSanityContent(props.context.sanity).then(content =>
		translate(props, content)
	)
}

export type Pages = Awaited<ReturnType<typeof getPages>>
