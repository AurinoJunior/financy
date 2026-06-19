import { asc, eq } from "drizzle-orm"
import { RecurringBillsView } from "@/components/recurring/recurring-bills-view"
import { db } from "@/db"
import { recurringBill } from "@/db/schema"
import { getSession } from "@/lib/get-session"

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
