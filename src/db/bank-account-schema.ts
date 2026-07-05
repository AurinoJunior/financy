import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const bankAccount = pgTable(
  "bank_account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'checking' | 'credit'
    bank: text("bank"), // 'nubank' | null
    balance: integer("balance").notNull().default(0), // centavos; checking=saldo atual, credit=limite
    closingDay: integer("closing_day"), // 1..31, somente para crédito
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("bank_account_userId_idx").on(table.userId)],
)

export type BankAccount = typeof bankAccount.$inferSelect
