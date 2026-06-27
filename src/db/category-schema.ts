import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

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
