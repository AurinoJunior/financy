import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const csvImport = pgTable("csv_import", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  bank: text("bank"), // e.g. 'nubank'
  accountType: text("account_type"), // 'credit' | 'debit'
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type CsvImport = typeof csvImport.$inferSelect
