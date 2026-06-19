"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { csvImport, transaction } from "@/db/schema"
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
