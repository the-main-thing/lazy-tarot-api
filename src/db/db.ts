import { drizzle } from 'drizzle-orm/bun-sqlite'

import { env } from '../env.ts'
import * as schema from './schema/index.ts'

export const db = drizzle({ schema, connection: { source: env.DB_FILE_NAME } })
