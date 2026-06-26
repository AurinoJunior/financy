import { desc, eq } from "drizzle-orm"
import { Dashboard } from "@/components/dashboard/dashboard"
import { db } from "@/db"
import { category, financialPlan, transaction } from "@/db/schema"
import { computeDashboard } from "@/lib/dashboard"
import { getSession } from "@/lib/get-session"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const { month } = await searchParams
  const userId = session.user.id

  const [transactions, categories, plans] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date), desc(transaction.createdAt)),
    db.select().from(category).where(eq(category.userId, userId)),
    db.select().from(financialPlan).where(eq(financialPlan.userId, userId)).limit(1),
  ])

  const data = computeDashboard(transactions, categories, month, plans[0] ?? null)
  return <Dashboard data={data} />
}
