import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { recurringBill } from "@/db/schema"
import { getSession } from "@/auth/session"
import { RecurringBillsView } from "@/views/recurring/recurring-bills-view"

export default async function RecorrentesPage() {
  const session = await getSession()
  if (!session) return null

  const bills = await db
    .select()
    .from(recurringBill)
    .where(eq(recurringBill.userId, session.user.id))
    .orderBy(asc(recurringBill.dueDay))

  return <RecurringBillsView bills={bills} />
}
