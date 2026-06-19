import { asc, eq } from "drizzle-orm"
import { CategoriesView } from "@/components/categories/categories-view"
import { db } from "@/db"
import { category } from "@/db/schema"
import { getSession } from "@/lib/get-session"

export default async function ConfiguracoesPage() {
  const session = await getSession()

  const categories = session
    ? await db
        .select()
        .from(category)
        .where(eq(category.userId, session.user.id))
        .orderBy(asc(category.type), asc(category.name))
    : []

  return <CategoriesView categories={categories} />
}
