import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as appSchema from "./app-schema"
import * as authSchema from "./auth-schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL não definida — confira o seu .env")
}

// Reaproveita a conexão entre hot-reloads do Next em desenvolvimento.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>
}

const client = globalForDb.client ?? postgres(connectionString)
if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client
}

export const db = drizzle(client, { schema: { appSchema, authSchema } })
