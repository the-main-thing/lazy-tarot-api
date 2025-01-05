import cookie from 'cookie'
import { randInt } from '../cms/utils/number'

const sessionCookieKey =
  process.env.NODE_ENV === 'development' ? 'session' : '__Secure-Session'

const secrets = Array(10)
  .fill('')
  .map(() => crypto.randomUUID())

export const session = {
  isValid: (cookieHeader: string | null) => {
    if (!cookieHeader) {
      return false
    }
    const sessionId = cookie.parse(cookieHeader)?.[sessionCookieKey]
    return secrets.includes(sessionId as never)
  },
  create: () => {
    return cookie.serialize(
      sessionCookieKey,
      secrets[randInt(0, secrets.length - 1)]!,
      {
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        path: '/',
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
      },
    )
  },
}
