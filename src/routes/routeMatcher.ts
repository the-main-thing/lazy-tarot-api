/**
 * I was thinking it would be nice to have a route tree like an object or
 * a map for fast retrieval. Or a cache for incoming routes i.e.
 * Map<string, [score, handler]>.
 *
 * But! Since routes are all relatively short - 5 segments at most
 * the computational cost of calculating hashes for retrieving cached value
 * or getting next node
 * from a tree is more than just iterate a coulple of times.
 *
 * This is scientifically proven by me:
 * https://github.com/the-main-thing/array-vs-set
 */
import type { Context } from 'src/createContext'

export type Params = Record<string, string>

export const getSegments = (string: string): Array<string> => {
  const result: Array<string> = []
  let currentSegment = ''
  for (let i = 0; i < string.length; i++) {
    const char = string.charAt(i)
    if (char === '/') {
      if (currentSegment) {
        result.push(currentSegment)
        currentSegment = ''
      }
      continue
    }
    currentSegment += char
  }
  if (currentSegment) {
    result.push(currentSegment)
  }
  return result
}

const matchRoute = (
  urlSegments: Array<string>,
  route: string,
): [score: number, params: Params] => {
  const routeSegments = getSegments(route)
  let matches = 0
  const params: Params = {}
  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i]!
    if (routeSegment.charAt(0) === '*') {
      matches += 0.5
      continue
    }

    const urlSegment = urlSegments[i]
    if (!urlSegment) {
      break
    }
    if (routeSegment.charAt(0) === ':') {
      matches += 0.75
      params[routeSegment.slice(1)] = urlSegment
      continue
    }

    if (routeSegment !== urlSegment) {
      break
    }
    matches += 1
  }

  return [
    matches && routeSegments.length
      ? (matches / routeSegments.length) * 100
      : 0,
    params,
  ]
}

type HandlerValue = Response | undefined | Symbol

export type Handler = (
  context: Context,
  params: Params,
) => HandlerValue | Promise<HandlerValue>

const DUMMY_OBJECT = {} as Record<string, string>

export type RoutesConfig =
  | { [route: string]: Handler }
  | Readonly<{ [route: string]: Handler }>

export const routeMatcher = (
  url: URL,
  routes: RoutesConfig,
): [null, null] | [Handler, Params] => {
  const routesEntries = Object.entries(routes) as Array<[string, Handler]>
  let bestMatch = 0
  let bestMatchIndex = -1
  let bestMatchParams = DUMMY_OBJECT
  const urlSegments = getSegments(url.pathname)
  for (let i = 0; i < routesEntries.length; i++) {
    const [score, params] = matchRoute(urlSegments, routesEntries[i]![0])
    if (score >= 100) {
      return [routesEntries[i]![1], params]
    }
    if (bestMatch < score) {
      bestMatch = score
      bestMatchIndex = i
      bestMatchParams = params
    }
  }

  if (bestMatchIndex <= 0) {
    return [null, null]
  }

  return [routesEntries[bestMatchIndex]![1], bestMatchParams]
}
