import { z } from 'zod'

export const envSchema = z.object({
  SANITY_STUDIO_PROJECT_ID: z.string(),
  LAZY_TAROT_API_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>

export type EnvKey = keyof Env
