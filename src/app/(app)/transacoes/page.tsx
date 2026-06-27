import { asc, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { category, transaction } from "@/db/schema"
import { getSession } from "@/lib/get-session"
import { TransactionsView } from "@/views/transactions/transactions-view"

export default async function TransacoesPage() {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id
  const [transactions, categories] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date), desc(transaction.createdAt)),
    db.select().from(category).where(eq(category.userId, userId)).orderBy(asc(category.name)),
  ])

  return <TransactionsView transactions={transactions} categories={categories} />
}
