import { pgTable, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const keyval = pgTable(
	"keyval",
	{
		key: varchar({ length: 255 }).primaryKey(),
		value: jsonb().notNull(),
		ttl: timestamp({ withTimezone: true }),
	},
	(table) => [index("key_idx").on(table.key), index("ttl_idx").on(table.ttl)],
);

export const table = {
	keyval,
} as const;

export type Table = typeof table;
