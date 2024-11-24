import { jsonResponse } from '../jsonResponse'
import { notFoundResponse } from '../notFoundResponse'
import type { Context } from '../createContext'
import { db } from '../db/db'
import { mobileClientErrors } from '../db/schema/mobileClientErrors'

const accepted = { accepted: true }

export const postMobile = async (context: Context) => {
  if (context.request.method !== 'POST') {
    throw notFoundResponse()
  }
  const url = new URL(context.request.url)
  const [version, client, ...rest] = url.pathname.split('/').filter(Boolean)
  if (version !== '0' || client !== 'mobile' || rest.length > 0) {
    throw notFoundResponse()
  }
  const text = await context.request.text()
  await db.insert(mobileClientErrors).values({
    text,
    updatedAt: Date.now(),
  })

  const [response, error] = jsonResponse(accepted)
  if (error) {
    throw error.error
  }
  return response
}
