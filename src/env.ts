import { z } from 'zod'

export const env = z.object({
	SANITY_STUDIO_PROJECT_ID: z.string(),
	LAZY_TAROT_API_KEY: z.string(),
	PORT: z.string().optional(),
}).parse(process.env)


export type Env = typeof env

export type EnvKey = keyof Env
