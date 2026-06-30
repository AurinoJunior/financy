"use server"

import { createHash } from "node:crypto"
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getSession } from "@/auth/session"
import { db } from "@/db"
import { category, csvImport, transaction } from "@/db/schema"
import { type AiExample, categorizeWithAI } from "@/services/ai-categorize"
import { type ImportPayload, importPayloadSchema, type ParsedRow } from "@/validations/transaction"

function computeContentHash(date: string, amount: number, description: string): string {
  return createHash("sha256").update(`${date}|${amount}|${description}`).digest("hex")
}

export async function checkDuplicates(rows: ParsedRow[]): Promise<{ duplicateIndices: number[] }> {
  const session = await getSession()
  if (!session || rows.length === 0) return { duplicateIndices: [] }

  const userId = session.user.id
  const hashes = rows.map((r) => computeContentHash(r.date, r.amount, r.description))
  const uniqueHashes = [...new Set(hashes)]

  if (uniqueHashes.length === 0) return { duplicateIndices: [] }

  const existing = await db
    .select({ contentHash: transaction.contentHash })
    .from(transaction)
    .where(and(eq(transaction.userId, userId), inArray(transaction.contentHash, uniqueHashes)))

  const existingSet = new Set(existing.map((e) => e.contentHash))
  const duplicateIndices = hashes
    .map((hash, i) => (existingSet.has(hash) ? i : -1))
    .filter((i) => i !== -1)

  return { duplicateIndices }
}

type ImportResult = { ok: true; count: number } | { ok: false; error: string }

export async function importTransactions(payload: ImportPayload): Promise<ImportResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = importPayloadSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: "Arquivo inválido" }

  const { filename, bank, accountType, rows } = parsed.data
  const userId = session.user.id

  await db.transaction(async (tx) => {
    const [imp] = await tx
      .insert(csvImport)
      .values({ userId, filename, rowCount: rows.length, bank, accountType })
      .returning()

    await tx.insert(transaction).values(
      rows.map((r) => ({
        userId,
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        bank: bank ?? null,
        accountType: accountType ?? null,
        importId: imp.id,
        contentHash: computeContentHash(r.date, r.amount, r.description),
      })),
    )
  })

  revalidatePath("/transacoes")
  revalidatePath("/")
  return { ok: true, count: rows.length }
}

type ActionResult = { ok: true } | { ok: false; error: string }

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  await db
    .delete(transaction)
    .where(and(eq(transaction.id, id), eq(transaction.userId, session.user.id)))
  revalidatePath("/transacoes")
  revalidatePath("/")
  return { ok: true }
}

type CategorizeResult = { ok: true; count: number } | { ok: false; error: string }

export async function categorizeUncategorized(): Promise<CategorizeResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }
  const userId = session.user.id

  const [uncategorized, categories, recentCategorized] = await Promise.all([
    db
      .select({
        id: transaction.id,
        description: transaction.description,
        bank: transaction.bank,
        accountType: transaction.accountType,
      })
      .from(transaction)
      .where(and(eq(transaction.userId, userId), isNull(transaction.categoryId))),
    db
      .select({ id: category.id, name: category.name, type: category.type })
      .from(category)
      .where(eq(category.userId, userId)),
    db
      .select({
        description: transaction.description,
        categoryName: category.name,
        bank: transaction.bank,
        accountType: transaction.accountType,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(and(eq(transaction.userId, userId), isNotNull(transaction.categoryId)))
      .orderBy(desc(transaction.date))
      .limit(100),
  ])

  if (uncategorized.length === 0) return { ok: true, count: 0 }
  if (categories.length === 0) {
    return { ok: false, error: "Crie categorias antes de usar a IA" }
  }

  const examples: AiExample[] = recentCategorized

  let mapping: Map<string, string>
  try {
    mapping = await categorizeWithAI(uncategorized, categories, examples)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha na categorização" }
  }

  if (mapping.size === 0) return { ok: true, count: 0 }

  // Agrupa por categoria para minimizar updates.
  const byCategory = new Map<string, string[]>()
  for (const [txId, catId] of mapping) {
    const ids = byCategory.get(catId) ?? []
    ids.push(txId)
    byCategory.set(catId, ids)
  }

  await db.transaction(async (tx) => {
    for (const [catId, txIds] of byCategory) {
      await tx
        .update(transaction)
        .set({ categoryId: catId })
        .where(and(eq(transaction.userId, userId), inArray(transaction.id, txIds)))
    }
  })

  revalidatePath("/transacoes")
  revalidatePath("/")
  return { ok: true, count: mapping.size }
}

export async function setTransactionCategory(
  id: string,
  categoryId: string | null,
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }
  const userId = session.user.id

  if (categoryId) {
    const [cat] = await db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.id, categoryId), eq(category.userId, userId)))
    if (!cat) return { ok: false, error: "Categoria inválida" }
  }

  await db
    .update(transaction)
    .set({ categoryId })
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
  revalidatePath("/transacoes")
  revalidatePath("/")
  return { ok: true }
}
