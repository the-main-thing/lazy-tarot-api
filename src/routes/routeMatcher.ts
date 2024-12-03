import type { Context } from 'src/createContext'

export type Params = Record<string, string>

const getSegments = (string: string): Array<string> => {
  const result: Array<string> = []
  let currentSegment = ''
  for (let i = 0; i < string.length; i++) {
    const char = string.charAt(i)
    if (char === '/' && currentSegment) {
      result.push(currentSegment)
      currentSegment = ''
      continue
    }
    currentSegment += char
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
    const urlSegment = urlSegments[i]
    if (!urlSegment) {
      break
    }
    const routeSegment = routeSegments[i]!
    if (routeSegment.charAt(0) === ':') {
      matches += 0.75
      params[routeSegment.slice(1)] = urlSegment
      continue
    }
    if (routeSegment.charAt(0) === '*') {
      matches += 0.5
      continue
    }

    if (routeSegment !== urlSegment) {
      break
    }
    matches += 1
  }

  return [
    (matches / Math.max(urlSegments.length, routeSegments.length)) * 100,
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
    if (bestMatch < score) {
      bestMatch = score
      bestMatchIndex = i
      bestMatchParams = params
    }
  }

  if (bestMatchIndex < 0) {
    return [null, null]
  }

  return [routesEntries[bestMatchIndex]![1], bestMatchParams]
}
