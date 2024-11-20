import type { Context } from '../createContext.js'
import { getAllPages } from './pages.js'
import { getCardsSet, getCardById, getRandomCard } from './tarot.js'
import type { TypedResponse } from '../typedResponse.type.js'

type RouterGuardType = {
	[routeName: `/${string}`]: (
		context: Context,
	) => Promise<TypedResponse<unknown>>
}

export const router = {
	['/get-all-pages']: getAllPages,
	['/get-cards-set']: getCardsSet,
	['/get-card-by-id']: getCardById,
	['/get-random-card']: getRandomCard,
} as const satisfies RouterGuardType

export type Router = typeof router
export type RouteName = keyof Router
type RouteHandler<TRouteName extends RouteName> = Router[TRouteName]
export type GetRouteData<TRouteName extends RouteName> = Awaited<ReturnType<Awaited<ReturnType<RouteHandler<TRouteName>>>['json']>>

export type RouteData = {
	[routeName in RouteName]: GetRouteData<routeName>
}