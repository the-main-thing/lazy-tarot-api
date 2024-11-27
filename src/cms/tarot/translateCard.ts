import { getTranslated } from '../sanity/getTranslated'
import { getImagesSet } from '../sanity/getImagesSet'
import type { Context } from '../../createContext'
import { BREAKPOINTS } from '../constants'
import type { CardContentQueryObject } from './cardContentQueryObject'

type Props = {
  language: string | undefined
  card: CardContentQueryObject
  context: {
    sanity: {
      client: Context['sanity']['client']
    }
  }
}

export const translateCard = ({ language, card, context }: Props) => {
  return {
    id: card._id,
    regular: {
      title: getTranslated(card.regular.title, language),
      shortDescription: getTranslated(
        card.regular.description.shortDescription,
        language,
      ),
      fullDescription: getTranslated(
        card.regular.description.fullDescription,
        language,
      ),
    },
    upsideDown: {
      title: getTranslated(card.upsideDown.title, language),
      shortDescription: getTranslated(
        card.upsideDown.description.shortDescription,
        language,
      ),
      fullDescription: getTranslated(
        card.upsideDown.description.fullDescription,
        language,
      ),
    },
    image: getImagesSet({
      client: context.sanity.client,
      image: card.image,
      breakpoints: BREAKPOINTS,
    }),
  }
}

export type TranslatedCard = ReturnType<typeof translateCard>

