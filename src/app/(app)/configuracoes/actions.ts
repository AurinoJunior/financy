"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { category } from "@/db/schema"
import { getSession } from "@/lib/get-session"
import { type CategoryInput, categorySchema } from "@/lib/validations/category"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  await db.insert(category).values({ ...parsed.data, userId: session.user.id })
  revalidatePath("/configuracoes")
  return { ok: true }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  await db
    .update(category)
    .set(parsed.data)
    .where(and(eq(category.id, id), eq(category.userId, session.user.id)))
  revalidatePath("/configuracoes")
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  await db.delete(category).where(and(eq(category.id, id), eq(category.userId, session.user.id)))
  revalidatePath("/configuracoes")
  return { ok: true }
}
