import { z } from 'zod'

export const env = z
	.object({
		SANITY_STUDIO_PROJECT_ID: z.string().min(1),
		LAZY_TAROT_API_KEY: z.string().min(1),
		DB_FILE_NAME: z.string().min(1),
		PORT: z.string().optional(),
	})
	.parse(process.env)

export type Env = typeof env

export type EnvKey = keyof Env
