import type { SanityClient } from "@sanity/client"
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types.js'

export const urlFor = (client: SanityClient, source: SanityImageSource) => {
	return imageUrlBuilder(client).image(source)
}
