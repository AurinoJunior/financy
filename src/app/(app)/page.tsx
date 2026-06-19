import { desc, eq } from "drizzle-orm"
import { Dashboard } from "@/components/dashboard/dashboard"
import { db } from "@/db"
import { category, recurringBill, transaction } from "@/db/schema"
import { computeDashboard } from "@/lib/dashboard"
import { getSession } from "@/lib/get-session"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id
  const [transactions, bills, categories] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date), desc(transaction.createdAt)),
    db.select().from(recurringBill).where(eq(recurringBill.userId, userId)),
    db.select().from(category).where(eq(category.userId, userId)),
  ])

  const data = computeDashboard(transactions, bills, categories)
  return <Dashboard data={data} />
}
