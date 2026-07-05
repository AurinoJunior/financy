import { asc, desc, eq } from "drizzle-orm"
import { getSession } from "@/auth/session"
import { db } from "@/db"
import { bankAccount, category, csvImport, financialPlan, recurringBill, transaction } from "@/db/schema"
import { Dashboard } from "@/views/dashboard/dashboard-view"
import { computeDashboard } from "@/views/dashboard/data"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const { month } = await searchParams
  const userId = session.user.id

  const [transactions, categories, plans, accounts, csvImports, recurringBills] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date), desc(transaction.createdAt)),
    db.select().from(category).where(eq(category.userId, userId)),
    db.select().from(financialPlan).where(eq(financialPlan.userId, userId)).limit(1),
    db.select().from(bankAccount).where(eq(bankAccount.userId, userId)).orderBy(asc(bankAccount.createdAt)),
    db.select().from(csvImport).where(eq(csvImport.userId, userId)),
    db.select().from(recurringBill).where(eq(recurringBill.userId, userId)),
  ])

  const data = computeDashboard(
    transactions,
    categories,
    accounts,
    csvImports,
    recurringBills,
    month,
    plans[0] ?? null,
  )
  return <Dashboard data={data} />
}
