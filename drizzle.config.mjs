import { defineConfig } from 'drizzle-kit';
import { env } from './src/env.ts'

export default defineConfig({
  dbCredentials: {
    url: env.DB_FILE_NAME,
  },
	out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'sqlite',
});
