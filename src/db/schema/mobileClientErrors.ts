import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const mobileClientErrors = sqliteTable('mobile_client_errors', {
  id: int().primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  updatedAt: int().notNull(),
})
