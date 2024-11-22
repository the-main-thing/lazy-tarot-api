import { jsonResponse } from '../jsonResponse.ts'
import { notFoundResponse } from '../notFoundResponse.ts'
import type { Context } from '../createContext.ts'
import { db } from '../db/db.ts'
import { mobileClientErrors } from '../db/schema/mobileClientErrors.ts'

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
