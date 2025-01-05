import { session } from './session'
import { env } from '../env'

const VALID_KEYS = [env.LAZY_TAROT_API_KEY, env.MOBILE_CLIENT_API_KEY, env.AUTOMATION_API_KEY]
export const hasValidKey = (request: Request) =>
  VALID_KEYS.includes(request.headers.get('x-api-key') as never) ||
  session.isValid(request.headers.get('cookie')) ||
  session.isValid(request.headers.get('x-api-key'))
