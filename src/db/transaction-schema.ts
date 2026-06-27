import { date, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"
import { category } from "./category-schema"
import { csvImport } from "./csv-import-schema"

export const transaction = pgTable(
  "transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(), // centavos, sempre positivo
    type: text("type").notNull(), // 'income' | 'expense'
    bank: text("bank"),
    accountType: text("account_type"), // 'credit' | 'debit'
    contentHash: text("content_hash"), // SHA-256(date|amount|description) para dedup
    categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
    importId: text("import_id").references(() => csvImport.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("transaction_userId_idx").on(table.userId),
    index("transaction_date_idx").on(table.date),
    index("transaction_userId_contentHash_idx").on(table.userId, table.contentHash),
  ],
)

export type Transaction = typeof transaction.$inferSelect
