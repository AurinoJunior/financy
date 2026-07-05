import { asc, desc, eq } from "drizzle-orm"
import { getSession } from "@/auth/session"
import { db } from "@/db"
import { bankAccount, category, transaction } from "@/db/schema"
import { TransactionsView } from "@/views/transactions/transactions-view"

export default async function TransacoesPage() {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id
  const [transactions, categories, accounts] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date), desc(transaction.createdAt), asc(transaction.id)),
    db.select().from(category).where(eq(category.userId, userId)).orderBy(asc(category.name)),
    db.select().from(bankAccount).where(eq(bankAccount.userId, userId)).orderBy(asc(bankAccount.createdAt)),
  ])

  return <TransactionsView transactions={transactions} categories={categories} accounts={accounts} />
}
