"use server"

import { and, eq, inArray, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { category, csvImport, transaction } from "@/db/schema"
import { categorizeWithAI } from "@/lib/ai-categorize"
import { getSession } from "@/lib/get-session"
import { type ImportPayload, importPayloadSchema } from "@/lib/validations/transaction"

type ImportResult = { ok: true; count: number } | { ok: false; error: string }

export async function importTransactions(payload: ImportPayload): Promise<ImportResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = importPayloadSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: "Arquivo inválido" }

  const { filename, rows } = parsed.data
  const userId = session.user.id

  await db.transaction(async (tx) => {
    const [imp] = await tx
      .insert(csvImport)
      .values({ userId, filename, rowCount: rows.length })
      .returning()

    await tx.insert(transaction).values(
      rows.map((r) => ({
        userId,
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        importId: imp.id,
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

  const [uncategorized, categories] = await Promise.all([
    db
      .select({ id: transaction.id, description: transaction.description })
      .from(transaction)
      .where(and(eq(transaction.userId, userId), isNull(transaction.categoryId))),
    db
      .select({ id: category.id, name: category.name, type: category.type })
      .from(category)
      .where(eq(category.userId, userId)),
  ])

  if (uncategorized.length === 0) return { ok: true, count: 0 }
  if (categories.length === 0) {
    return { ok: false, error: "Crie categorias antes de usar a IA" }
  }

  let mapping: Map<string, string>
  try {
    mapping = await categorizeWithAI(uncategorized, categories)
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
