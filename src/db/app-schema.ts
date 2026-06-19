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
  ],
)

export type CsvImport = typeof csvImport.$inferSelect
export type Transaction = typeof transaction.$inferSelect
