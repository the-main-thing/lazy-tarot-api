import type { SanityClient } from '@sanity/client'

import { parseNumber } from '../utils/number'

import type { Image } from './schemas'
import { urlFor } from './urlFor'

// https://cdn.sanity.io/images/<project id>/<dataset name>/<asset name>-<original width>x<original height>.<original file format>
const getDimentions = (src: string) => {
  const url = new URL(src)
  const info = url.pathname.split('/').filter(Boolean)[3]
  if (!info) {
    return null
  }

  // <asset name>-<original width>x<original height>.<original file format>
  const dimentions = (
    info.split('-')[1]?.split('.')[0]?.split('x') || [NaN, NaN]
  ).map((value) => parseNumber(value, null))

  if (!dimentions[0] || !dimentions[1] || dimentions.length !== 2) {
    return null
  }

  return dimentions as [width: number, height: number]
}

export const getImagesSet = <TBreakpoints extends Record<number, number>>({
  client,
  image,
  breakpoints,
  format,
}: {
  client: SanityClient
  format?: 'png' | 'jpg'
  breakpoints: TBreakpoints
  image: Image
}): {
  dimentions: [width: number, height: number]
  srcSet: {
    [key in keyof TBreakpoints]: {
      src: string
      width: TBreakpoints[key]
    }
  }
} => {
  let dimentions = null as null | [width: number, height: number]
  const entries = Object.entries(breakpoints).map(([breakPoint, width]) => {
    let src = urlFor(client, image)
      .width(width)
      .fit('clip')
      .format(format || 'jpg')
      .quality(breakPoint === 'placeholder' ? 30 : 90)
      .url()
      .replace(/^https:\/\/cdn\.sanity\.io/, '')

    if (dimentions === null) {
      dimentions = getDimentions(src)
    }

    return [
      breakPoint,
      {
        src,
        width,
      },
    ]
  })

  return {
    dimentions: dimentions as NonNullable<typeof dimentions>,
    srcSet: Object.fromEntries(entries) as {
      [key in keyof TBreakpoints]: {
        src: string
        width: TBreakpoints[key]
      }
    },
  }
}
