import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { eq } from "drizzle-orm"
import Papa from "papaparse"
import { auth } from "../src/auth/server"
import { db } from "../src/db"
import {
  bankAccount,
  category,
  csvImport,
  financialPlan,
  recurringBill,
  transaction,
} from "../src/db/app-schema"
import { account, session, user, verification } from "../src/db/auth-schema"
import type { ColumnMapping } from "../src/utils/csv"
import { detectBankFormat, getAutoMapping, isFlipSign, normalizeRow } from "../src/utils/csv"

const SEED_EMAIL = "maria@financy.dev"
const SEED_PASSWORD = "financy123"
const SEED_NAME = "Maria"

const BASE_DIR = resolve(new URL(".", import.meta.url).pathname, "..")

type CsvFile = {
  file: string
  bank: string
  accountType: "debit" | "credit"
  bankAccountId?: string
}

const CSV_FILE_TEMPLATES: Omit<CsvFile, "bankAccountId">[] = [
  { file: "exemplos/nu-debito.csv", bank: "nubank", accountType: "debit" },
  { file: "exemplos/nu-credito.csv", bank: "nubank", accountType: "credit" },
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
  await db.delete(bankAccount)
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

async function seedBankAccounts(userId: string): Promise<{ checkingId: string; creditId: string }> {
  console.log("🏦 Inserindo contas bancárias...")

  const [checking] = await db
    .insert(bankAccount)
    .values({
      userId,
      name: "Conta Corrente Nubank",
      type: "checking",
      bank: "nubank",
      balance: 380000,
    })
    .returning()

  const [credit] = await db
    .insert(bankAccount)
    .values({
      userId,
      name: "Cartão Nubank",
      type: "credit",
      bank: "nubank",
      balance: 500000,
      closingDay: 26,
    })
    .returning()

  console.log("   2 contas inseridas.\n")
  return { checkingId: checking.id, creditId: credit.id }
}

async function seedTransactions(
  userId: string,
  accountIds: { checkingId: string; creditId: string },
) {
  console.log("📄 Importando transações...")

  const CSV_FILES: CsvFile[] = [
    { ...CSV_FILE_TEMPLATES[0], bankAccountId: accountIds.checkingId },
    { ...CSV_FILE_TEMPLATES[1], bankAccountId: accountIds.creditId },
  ]

  for (const { file, bank, accountType, bankAccountId } of CSV_FILES) {
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
        bankAccountId,
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

async function seedFinancialPlan(userId: string) {
  await db.insert(financialPlan).values({
    userId,
    simulationIncome: 750000, // R$ 7.500
    essentialPct: 50,
    nonEssentialPct: 30,
    patrimonyPct: 20,
  })
}

async function seedRecurringBills(userId: string) {
  console.log("🔁 Inserindo contas recorrentes...")

  const bills = [
    { name: "Aluguel", amount: 150000, dueDay: 5, essential: true, paymentType: "pix" },
    { name: "Internet", amount: 9990, dueDay: 10, essential: true, paymentType: "boleto" },
    { name: "Energia elétrica", amount: 18000, dueDay: 15, essential: true, paymentType: "boleto" },
    { name: "Água", amount: 6500, dueDay: 20, essential: true, paymentType: "boleto" },
    {
      name: "Plano de saúde",
      amount: 45000,
      dueDay: 5,
      essential: true,
      paymentType: "debit_auto",
    },
    { name: "Academia", amount: 9990, dueDay: 1, essential: false, paymentType: "debit_auto" },
    {
      name: "Streaming (vídeo)",
      amount: 4490,
      dueDay: 18,
      essential: false,
      paymentType: "credit",
    },
    {
      name: "Streaming (música)",
      amount: 2190,
      dueDay: 22,
      essential: false,
      paymentType: "credit",
    },
  ]

  await db.insert(recurringBill).values(bills.map((b) => ({ ...b, userId })))

  console.log(`   ${bills.length} contas recorrentes inseridas.\n`)
}

async function main() {
  await clearDatabase()
  const maria = await createUser()
  const accountIds = await seedBankAccounts(maria.id)
  await seedTransactions(maria.id, accountIds)
  await seedFinancialPlan(maria.id)
  await seedRecurringBills(maria.id)
  console.log("\n✅ Seed concluído.")
}

main()
  .catch((err) => {
    console.error("❌", err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
