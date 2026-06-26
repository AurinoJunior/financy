import { boolean, date, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

// Tipo da categoria: gasto essencial ou não essencial.
// Guardado como text (SQLite/Postgres-friendly), validado por Zod na app.
export const category = pgTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("non_essential"), // 'essential' | 'non_essential'
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("category_userId_idx").on(table.userId)],
)

export type Category = typeof category.$inferSelect

// Registro de cada importação de CSV.
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

// Transação: valor sempre positivo em centavos; sinal vira `type`.
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
    bank: text("bank"), // e.g. 'nubank'
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

export type CsvImport = typeof csvImport.$inferSelect
export type Transaction = typeof transaction.$inferSelect

// Conta recorrente: valor mensal em centavos, dia de vencimento, essencial ou não.
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

// Planejamento financeiro: percentuais e renda de simulação (um por usuário).
export const financialPlan = pgTable("financial_plan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  essentialPct: integer("essential_pct").notNull().default(50),
  nonEssentialPct: integer("non_essential_pct").notNull().default(30),
  patrimonyPct: integer("patrimony_pct").notNull().default(20),
  simulationIncome: integer("simulation_income"), // centavos, nullable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type FinancialPlan = typeof financialPlan.$inferSelect
