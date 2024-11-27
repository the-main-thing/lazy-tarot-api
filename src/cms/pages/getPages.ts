import { getTranslated } from '../sanity/getTranslated'
import { getImagesSet } from '../sanity/getImagesSet'

import { BREAKPOINTS } from '../constants'

import type { Context } from '../../createContext'
import type { I18n, I18nBlock, Image } from '../sanity/schemas'

type Params = {
  language?: string
  context: {
    sanity: {
      client: Context['sanity']['client']
    }
  }
}

type SanityClient = Context['sanity']['client']

async function errorAsValue<TValue>(
  promise: Promise<TValue>,
): Promise<[NonNullable<TValue>, null] | [null, unknown]> {
  try {
    const value = await promise
    if (!value) {
      throw new Error('No data returned from cms')
    }
    return [value, null]
  } catch (error) {
    return [null, error]
  }
}

function queryRootLayoutContent(client: SanityClient) {
  return client.fetch<{
    _id: string
    manifestoLinkTitle: I18n
    tarotReadingLinkTitle: I18n
    ogData: Array<{
      property: string
      content: I18n
    }>
  }>('*[_type=="rootLayout"][0]')
}

async function queryIndexPageContent(client: SanityClient) {
  return client.fetch<{
    _id: string
    title: I18n
    description: I18n
    headerTitle: I18nBlock
    headerDescription: I18nBlock
  }>('*[_type=="indexPage"][0]')
}

async function queryTarotReadingPageContent(client: SanityClient) {
  return client.fetch<{
    _id: string
    headerTitle: I18nBlock
    pickedCardTitle: I18nBlock
    formDescription: I18nBlock
    cardDescriptionHeaderText: I18n
    submitButtonLabel: I18n
    cardBackImage: Image
    pickNextCardButtonLabel: I18n
  }>('*[_type=="tarotReadingPage"][0]')
}

async function queryManifestoPageContent(client: SanityClient) {
  return client.fetch<{
    _id: string
    content: I18nBlock
    header: I18nBlock
    headerImage: Image
    contentImage: Image
  }>('*[_type=="manifestoPage"][0]')
}

async function queryAboutUsPageContent(client: SanityClient) {
  return client.fetch<{
    _id: string
    header: {
      teamTitle: I18n
      pageTitle: I18n
    }
    image: Image
    social: Array<{
      title: I18n
      urlTitle: I18n
      url: string
    }>
  }>('*[_type=="aboutUsPage"][0]')
}

const getSanityContent = async (client: SanityClient) => {
  const [
    [rootLayoutContent, rootLayoutError],
    [indexPageContent, indexPageError],
    [tarotReadingPageContent, tarotReadingPageError],
    [manifestoPageContent, manifestoPageError],
    [aboutUsPageContent, aboutUsPageError],
  ] = await Promise.all([
    errorAsValue(queryRootLayoutContent(client)),
    errorAsValue(queryIndexPageContent(client)),
    errorAsValue(queryTarotReadingPageContent(client)),
    errorAsValue(queryManifestoPageContent(client)),
    errorAsValue(queryAboutUsPageContent(client)),
  ])

  if (
    !rootLayoutContent ||
    !indexPageContent ||
    !tarotReadingPageContent ||
    !manifestoPageContent ||
    !aboutUsPageContent
  ) {
    throw (
      (rootLayoutError as Error) ||
      (indexPageError as Error) ||
      (tarotReadingPageError as Error) ||
      (manifestoPageError as Error) ||
      (aboutUsPageError as Error) ||
      new Error('PANIC: Unexpected state: no data and no errors')
    )
  }

  return {
    rootLayoutContent,
    indexPageContent,
    tarotReadingPageContent,
    manifestoPageContent,
    aboutUsPageContent,
  }
}

const translate = (
  { language, context }: Pick<Params, 'language' | 'context'>,
  {
    rootLayoutContent,
    indexPageContent,
    tarotReadingPageContent,
    manifestoPageContent,
    aboutUsPageContent,
  }: Awaited<ReturnType<typeof getSanityContent>>,
) => {
  const client = context.sanity.client

  return {
    rootLayoutContent: {
      manifestoLinkTitle: getTranslated(
        rootLayoutContent.manifestoLinkTitle,
        language,
      ),
      tarotReadingLinkTitle: getTranslated(
        rootLayoutContent.tarotReadingLinkTitle,
        language,
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
        language,
      ),
    },
    tarotReadingPageContent: {
      headerTitle: getTranslated(tarotReadingPageContent.headerTitle, language),
      pickedCardTitle: getTranslated(
        tarotReadingPageContent.pickedCardTitle,
        language,
      ),
      formDescription: getTranslated(
        tarotReadingPageContent.formDescription,
        language,
      ),
      cardDescriptionHeaderText: getTranslated(
        tarotReadingPageContent.cardDescriptionHeaderText,
        language,
      ),
      submitButtonLabel: getTranslated(
        tarotReadingPageContent.submitButtonLabel,
        language,
      ),
      cardBackImage: getImagesSet<typeof BREAKPOINTS>({
        client,
        image: tarotReadingPageContent.cardBackImage,
        breakpoints: BREAKPOINTS,
      }),
      pickNextCardButtonLabel: getTranslated(
        tarotReadingPageContent.pickNextCardButtonLabel,
        language,
      ),
    },
    manifestoPageContent: {
      header: getTranslated(manifestoPageContent.header, language),
      content: getTranslated(manifestoPageContent.content, language),
      headerImage: getImagesSet<{ [key in keyof typeof BREAKPOINTS]: 700 }>({
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
          },
        ),
      }),
      contentImage: getImagesSet<typeof BREAKPOINTS>({
        client,
        image: manifestoPageContent.contentImage,
        breakpoints: BREAKPOINTS,
      }),
    },
    aboutUsPageContent: {
      id: aboutUsPageContent._id,
      header: {
        teamTitle: getTranslated(aboutUsPageContent.header.teamTitle, language),
        pageTitle: getTranslated(aboutUsPageContent.header.pageTitle, language),
      },
      image: getImagesSet<typeof BREAKPOINTS>({
        client,
        image: aboutUsPageContent.image,
        breakpoints: BREAKPOINTS,
      }),
      social: aboutUsPageContent.social.map((link) => ({
        title: getTranslated(link.title, language),
        urlTitle: getTranslated(link.urlTitle, language),
        url: link.url,
      })),
    },
  }
}

export function getPages(props: Params) {
  return getSanityContent(props.context.sanity.client).then((content) =>
    translate(props, content),
  )
}

export type Pages = Awaited<ReturnType<typeof getPages>>
