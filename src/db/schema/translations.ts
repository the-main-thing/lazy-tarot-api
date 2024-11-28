/**
 * I am well aware that this does not look like "production" code
 */
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const translationsAdmins = sqliteTable('translations_admins', {
  login: text().notNull().primaryKey(),
  passwordHash: text().notNull(),
  lastLogin: int().notNull(),
})

export const translationsContent = sqliteTable('translations_content', {
  key: text().notNull().primaryKey(),
  value: text().notNull(),
})

