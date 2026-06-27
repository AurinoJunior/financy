"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { category, financialPlan } from "@/db/schema"
import { getSession } from "@/auth/session"
import { type CategoryInput, categorySchema } from "@/validations/category"

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

interface FinancialPlanInput {
  essentialPct: number
  nonEssentialPct: number
  patrimonyPct: number
  simulationIncome: number | null
}

export async function saveFinancialPlan(input: FinancialPlanInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Não autenticado" }

  const total = input.essentialPct + input.nonEssentialPct + input.patrimonyPct
  if (total !== 100) return { ok: false, error: "A soma dos percentuais deve ser 100%" }

  const userId = session.user.id
  await db
    .insert(financialPlan)
    .values({ userId, ...input })
    .onConflictDoUpdate({
      target: financialPlan.userId,
      set: {
        essentialPct: input.essentialPct,
        nonEssentialPct: input.nonEssentialPct,
        patrimonyPct: input.patrimonyPct,
        simulationIncome: input.simulationIncome,
        updatedAt: new Date(),
      },
    })

  revalidatePath("/configuracoes")
  return { ok: true }
}
