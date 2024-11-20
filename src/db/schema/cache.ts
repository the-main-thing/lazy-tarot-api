import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cache = sqliteTable("cache_table", {
	key: text().primaryKey(),
	value: text().notNull(),
	updatedAt: int().notNull(),
});
