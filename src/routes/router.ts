import { createContext, type Context } from '../createContext'
import { getAllPages } from './pages'
import { getCardsSet, getCardById, getRandomCard } from './tarot'
import { postMobileError } from './clientErrors'
import { mobileInit } from './mobileInit'
import { hasValidKey } from './hasValidKey'
import { notFoundResponse } from '../notFoundResponse'
import { env } from '../env'
import type { TypedResponse } from '../typedResponse.type'

type Handler<TData> = (context: Context) => Promise<TypedResponse<TData>>
type RouterGuardType = {
  [routeName: `/${string}`]: Handler<unknown>
}

const withKey =
  <TData>(routeHandler: Handler<TData>) =>
  (context: Context) => {
    if (hasValidKey(context.request)) {
      return routeHandler(context)
    }
    throw new Response(null, { status: 401 })
  }

const routesMap = {
  ['/get-all-pages']: withKey(getAllPages),
  ['/get-cards-set']: withKey(getCardsSet),
  ['/get-card-by-id']: withKey(getCardById),
  ['/get-random-card']: withKey(getRandomCard),
  ['/mobile/0/error']: withKey(postMobileError),
  ['/mobile/0/init']: mobileInit,
} as const satisfies RouterGuardType

export const router = (request: Request) => {
  let [rootRouteName, ...restOfTheName] = new URL(request.url).pathname
    .split('/')
    .filter(Boolean)
  rootRouteName = `/${rootRouteName}`
  if (rootRouteName in routesMap) {
    return routesMap[rootRouteName as RouteName](
      createContext(env.SANITY_STUDIO_PROJECT_ID, request),
    )
  }
  if (rootRouteName === '/mobile') {
    const [version, pathName] = restOfTheName
    const routeName = (rootRouteName +
      '/' +
      version +
      '/' +
      pathName) as RouteName
    return routesMap[routeName]?.(
      createContext(env.SANITY_STUDIO_PROJECT_ID, request) ||
        notFoundResponse(),
    )
  }
  return notFoundResponse()
}

export type Router = typeof routesMap
export type RouteName = keyof Router
type RouteHandler = {
  [routeName in RouteName]: Router[routeName]
}
type GetRouteData<TRouteName extends RouteName> = Awaited<
  ReturnType<Awaited<ReturnType<RouteHandler[TRouteName]>>['json']>
>

export type RouteData = {
  [routeName in RouteName]: GetRouteData<routeName>
}
