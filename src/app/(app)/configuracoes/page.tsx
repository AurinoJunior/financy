import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { category, financialPlan } from "@/db/schema"
import { getSession } from "@/lib/get-session"
import { CategoriesView } from "@/views/categories/categories-view"

export default async function ConfiguracoesPage() {
  const session = await getSession()

  const [categories, plans] = session
    ? await Promise.all([
        db
          .select()
          .from(category)
          .where(eq(category.userId, session.user.id))
          .orderBy(asc(category.type), asc(category.name)),
        db.select().from(financialPlan).where(eq(financialPlan.userId, session.user.id)).limit(1),
      ])
    : [[], []]

  return <CategoriesView categories={categories} plan={plans[0] ?? null} />
}
