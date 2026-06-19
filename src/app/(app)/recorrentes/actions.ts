"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { recurringBill } from "@/db/schema"
import { getSession } from "@/lib/get-session"
import { type RecurringBillInput, recurringBillSchema } from "@/lib/validations/recurring-bill"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function createRecurringBill(input: RecurringBillInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = recurringBillSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  await db.insert(recurringBill).values({ ...parsed.data, userId: session.user.id })
  revalidatePath("/recorrentes")
  return { ok: true }
}

export async function updateRecurringBill(
  id: string,
  input: RecurringBillInput,
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = recurringBillSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  await db
    .update(recurringBill)
    .set(parsed.data)
    .where(and(eq(recurringBill.id, id), eq(recurringBill.userId, session.user.id)))
  revalidatePath("/recorrentes")
  return { ok: true }
}

export async function toggleRecurringBill(id: string, active: boolean): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  await db
    .update(recurringBill)
    .set({ active })
    .where(and(eq(recurringBill.id, id), eq(recurringBill.userId, session.user.id)))
  revalidatePath("/recorrentes")
  return { ok: true }
}

export async function deleteRecurringBill(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  await db
    .delete(recurringBill)
    .where(and(eq(recurringBill.id, id), eq(recurringBill.userId, session.user.id)))
  revalidatePath("/recorrentes")
  return { ok: true }
}
