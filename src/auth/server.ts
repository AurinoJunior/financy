import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { DEFAULT_CATEGORIES } from "@/constants/categories"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { category } from "@/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // renova a cada 1 dia
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          // Cria as categorias padrão (pt-BR) para cada novo usuário.
          await db.insert(category).values(
            DEFAULT_CATEGORIES.map((c) => ({
              ...c,
              userId: createdUser.id,
              isDefault: true,
            })),
          )
        },
      },
    },
  },
})
