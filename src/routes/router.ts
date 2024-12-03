import { createContext, type Context } from '../createContext'
import { getAllPages } from './pages'
import { getCardsSet, getCardById, getRandomCard } from './tarot'
import { postMobileError } from './clientErrors'
import { mobileInit } from './mobileInit'
import { hasValidKey } from './hasValidKey'
import { env } from '../env'
import type { TypedResponse } from '../typedResponse.type'
import { translationsRoutesConfig } from './translations'
import { updater } from './updater'
import { routeMatcher, type Params, type RoutesConfig } from './routeMatcher'
import { UPGRADE_CONNECTION_RESPONSE } from './constants'
import { handleImageDownload } from './handleImageDownload'

type Handler<TData, TParams extends Params> = (
  context: Context,
  params: TParams,
) => Promise<TypedResponse<TData>>

const withKey =
  <TData, TParams extends Params>(routeHandler: Handler<TData, TParams>) =>
  (...args: Parameters<Handler<TData, TParams>>) => {
    const [context, params] = args
    if (hasValidKey(context.request)) {
      return routeHandler(context, params)
    }
    throw new Response(null, { status: 401 })
  }

const routesConfig = {
  ['/images/*']: (context) => {
    return handleImageDownload(context.request)
  },
  ['/api/v1/status']: (context) => {
    if (context.request.method === 'GET') {
      return new Response(null, {
        status: 200,
      })
    }
  },
  ['/api/v1/get-all-pages/:language']: (context, params) =>
    withKey(getAllPages)(context, params as never),
  ['/api/v1/get-cards-set/:language']: (context, params) =>
    withKey(getCardsSet)(context, params as never),
  ['/api/v1/get-card-by-id/:language/:id']: (context, params) =>
    withKey(getCardById)(context, params as never),
  ['/api/v1/get-random-card/:language']: (context, params) =>
    withKey(getRandomCard)(context, params as never),
  ['/api/v1/mobile/error']: (context, params) =>
    withKey(postMobileError)(context, params as never),
  ['/api/v1/mobile/init']: (context) => mobileInit(context),
  ['/api/v1/updater']: (context) => updater(context.request),
  ...translationsRoutesConfig,
} as const satisfies RoutesConfig

export const router = async (request: Request) => {
  const url = new URL(request.url)
  const [routeHandler, params] = routeMatcher(url, routesConfig)
  if (!routeHandler) {
    return new Response(null, {
      status: 404,
    })
  }
  const response = await routeHandler(
    createContext(env.SANITY_STUDIO_PROJECT_ID, request),
    params,
  )
  if (!response) {
    return new Response(null, {
      status: 404,
    })
  }
  if (response === UPGRADE_CONNECTION_RESPONSE) {
    return undefined
  }

  return response
}

export type Router = typeof routesConfig
export type RouteName = keyof Router
export type RouteResponses = {
  [routeName in RouteName]: Awaited<ReturnType<Router[routeName]>>
}
type JSONData<T extends TypedResponse<any>> = Awaited<ReturnType<T['json']>>
type ExtractData<T extends Router[RouteName]> =
  Awaited<ReturnType<T>> extends TypedResponse<any>
    ? JSONData<Awaited<ReturnType<T>>>
    : undefined

export type RouteData = {
  [routeName in RouteName]: ExtractData<Router[routeName]>
}
