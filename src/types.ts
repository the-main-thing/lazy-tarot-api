type PortableTextBlock = Record<PropertyKey, any>

type ImageSrcSet<
  TBreakpoints extends Record<number, number>,
> = {
  dimentions: [width: number, height: number]
  srcSet: {
    [key in keyof TBreakpoints]: {
      src: string
      width: TBreakpoints[key]
    }
  }
}

export interface RootLayoutContent {
  manifestoLinkTitle: string
  tarotReadingLinkTitle: string
  ogData: Array<{
    property: string
    content: string
  }>
}

export interface IndexPageContent {
  title: string
  description: string
  headerTitle: PortableTextBlock
  headerDescription: PortableTextBlock
}

export interface TarotReadingPageContent<
  TBreakpoints extends Record<number, number> = Record<number, number>,
> {
  headerTitle: PortableTextBlock
  pickedCardTitle: PortableTextBlock
  formDescription: PortableTextBlock
  cardDescriptionHeaderText: string
  submitButtonLabel: string
  cardBackImage: ImageSrcSet<TBreakpoints>
  pickNextCardButtonLabel: string
}

export interface ManifestoPageContent<
  TBreakpoints extends Record<number, number> = Record<number, number>,
> {
  header: PortableTextBlock
  content: PortableTextBlock
  headerImage: ImageSrcSet<TBreakpoints>
  contentImage: ImageSrcSet<TBreakpoints>
}

export interface AboutUsPageContent<
  TBreakpoints extends Record<number, number> = Record<number, number>,
> {
  header: {
    teamTitle: string
    pageTitle: string
  }
  image: ImageSrcSet<TBreakpoints>
  social: Array<{
    title: string
    urlTitle: string
    url: string
  }>
}

interface CardDescription {
  title: string
  shortDescription: string
  fullDescription: PortableTextBlock
}

export interface Card<
  TBreakpoints extends Record<number, number> = Record<number, number>,
> {
  id: string
  regular: CardDescription
  upsideDown: CardDescription
  image: ImageSrcSet<TBreakpoints>
}

export type CardsSet<
  TBreakpoints extends Record<number, number> = Record<number, number>,
> = Readonly<[Card<TBreakpoints>, ...ReadonlyArray<Card<TBreakpoints>>]>
