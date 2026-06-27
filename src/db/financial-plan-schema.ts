import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

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
