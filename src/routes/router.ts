import { createContext, type Context } from '../createContext'
import { getAllPages } from './pages'
import { getCardsSet, getCardById, getRandomCard } from './tarot'
import { postMobile } from './clientErrors'
import { mobileInit, mobileInitMatch } from './mobileInit'
import { hasValidKey } from './hasValidKey'
import { notFoundResponse } from '../notFoundResponse'
import { env } from '../env'
import type { TypedResponse } from '../typedResponse.type'

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
  ['/0/mobile']: postMobile,
} as const satisfies RouterGuardType

const isRouteName = (value: string): value is keyof typeof router =>
  value in router

export const handleRequest = (request: Request) => {
  if (!hasValidKey(request)) {
    if (mobileInitMatch(new URL(request.url))) {
      return mobileInit(request)
    }
    return new Response(null, { status: 401 })
  }

  let [routeName] = new URL(request.url).pathname.split('/').filter(Boolean)
  routeName = `/${routeName}`
  if (!isRouteName(routeName)) {
    throw notFoundResponse()
  }
  return router[routeName](createContext(env.SANITY_STUDIO_PROJECT_ID, request))
}

export type Router = typeof router
export type RouteName = keyof Router
type RouteHandler<TRouteName extends RouteName> = Router[TRouteName]
export type GetRouteData<TRouteName extends RouteName> = Awaited<
  ReturnType<Awaited<ReturnType<RouteHandler<TRouteName>>>['json']>
>

export type RouteData = {
  [routeName in RouteName]: GetRouteData<routeName>
}
