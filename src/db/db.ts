import { drizzle } from 'drizzle-orm/bun-sqlite'

import { env } from '../env'
import * as schema from './schema/index'

export const db = drizzle({ schema, connection: { source: env.DB_FILE_NAME } })
