import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const recurringBill = pgTable(
  "recurring_bill",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: integer("amount").notNull(), // centavos
    dueDay: integer("due_day").notNull(), // 1..31
    essential: boolean("essential").notNull().default(true),
    active: boolean("active").notNull().default(true),
    paymentType: text("payment_type"), // 'pix' | 'boleto' | 'credit' | 'debit_auto'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("recurring_bill_userId_idx").on(table.userId)],
)

export type RecurringBill = typeof recurringBill.$inferSelect
