import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { eq } from "drizzle-orm"
import Papa from "papaparse"
import { db } from "../src/db"
import {
  category,
  csvImport,
  financialPlan,
  recurringBill,
  transaction,
} from "../src/db/app-schema"
import { account, session, user, verification } from "../src/db/auth-schema"
import { auth } from "../src/lib/auth"
import type { ColumnMapping } from "../src/lib/csv"
import { detectBankFormat, getAutoMapping, isFlipSign, normalizeRow } from "../src/lib/csv"

const SEED_EMAIL = "maria@financy.dev"
const SEED_PASSWORD = "financy123"
const SEED_NAME = "Maria"

const BASE_DIR = resolve(new URL(".", import.meta.url).pathname, "..")

const CSV_FILES = [
  { file: "exemplos/nu-debito.csv", bank: "nubank", accountType: "debit" as const },
  { file: "exemplos/nu-credito.csv", bank: "nubank", accountType: "credit" as const },
]

function hash(date: string, amount: number, description: string) {
  return createHash("sha256").update(`${date}|${amount}|${description}`).digest("hex")
}

async function clearDatabase() {
  console.log("🗑️  Limpando banco...")
  await db.delete(verification)
  await db.delete(session)
  await db.delete(transaction)
  await db.delete(csvImport)
  await db.delete(recurringBill)
  await db.delete(financialPlan)
  await db.delete(category)
  await db.delete(account)
  await db.delete(user)
  console.log("   Banco limpo.\n")
}

async function createUser() {
  console.log(`👤 Criando usuária ${SEED_EMAIL}`)
  await auth.api.signUpEmail({
    body: { email: SEED_EMAIL, password: SEED_PASSWORD, name: SEED_NAME },
  })

  const [maria] = await db.select().from(user).where(eq(user.email, SEED_EMAIL))
  if (!maria) throw new Error("Falha ao criar usuária após signUpEmail")

  console.log(`   Criada com id ${maria.id} e senha ${SEED_PASSWORD}\n`)
  return maria
}

async function seedTransactions(userId: string) {
  console.log("📄 Importando transações...")

  for (const { file, bank, accountType } of CSV_FILES) {
    const content = readFileSync(resolve(BASE_DIR, file), "utf-8")
    const { data, meta } = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
    })

    const headers = meta.fields ?? []
    const format = detectBankFormat(headers)
    const mapping = getAutoMapping(format, headers) as ColumnMapping
    const flip = isFlipSign(format)

    const rows = data.map((row) => normalizeRow(row, mapping, flip)).filter((r) => r !== null)

    const [imported] = await db
      .insert(csvImport)
      .values({
        userId,
        filename: file.split("/").pop()!,
        rowCount: rows.length,
        bank,
        accountType,
      })
      .returning()

    if (rows.length > 0) {
      await db.insert(transaction).values(
        rows.map((r) => ({
          userId,
          date: r.date,
          description: r.description,
          amount: r.amount,
          type: r.type,
          bank,
          accountType,
          contentHash: hash(r.date, r.amount, r.description),
          importId: imported.id,
        })),
      )
    }

    console.log(`   ${file}: ${rows.length} transações (${accountType})`)
  }
}

async function main() {
  await clearDatabase()
  const maria = await createUser()
  await seedTransactions(maria.id)
  console.log("\n✅ Seed concluído.")
}

main()
  .catch((err) => {
    console.error("❌", err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
