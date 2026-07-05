import type { BankAccount, Category, CsvImport, FinancialPlan, RecurringBill, Transaction } from "@/db/app-schema"

export type CategorySlice = {
  id: string
  name: string
  color: string
  icon: string
  type: string
  total: number
  pct: number
}

export type MonthBar = { key: string; label: string; total: number }

export type PlanGroup = { planned: number; real: number }

export type PlanVsReal = {
  monthlyIncome: number
  essential: PlanGroup
  nonEssential: PlanGroup
  patrimonyPlanned: number
}

export type AccountCard = {
  id: string
  name: string
  bank: string | null
  type: "checking" | "credit"
  balanceCents: number
  updatedAtIso: string
  cycleBill: number
  cycleStart: string
  cycleEnd: string
  daysUntilClose: number
  isPastCycle: boolean
}

export type PlanningWidget = {
  checkingTotal: number
  billsDueThisWeek: number
  available: number
}

export type DashboardData = {
  currentMonth: string
  monthLabel: string
  availableMonths: string[]
  expenses: number
  income: number
  balance: number
  byCategory: CategorySlice[]
  byMonth: MonthBar[]
  topExpenses: Transaction[]
  planVsReal: PlanVsReal | null
  hasData: boolean
  accountCards: AccountCard[]
  planningWidget: PlanningWidget | null
}

const UNCATEGORIZED: Pick<CategorySlice, "name" | "color" | "icon"> = {
  name: "Sem categoria",
  color: "#64748b",
  icon: "other",
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getBillingCycle(closingDay: number, today: Date): { start: string; end: string } {
  const d = today.getDate()
  const rawCloseMonth = d > closingDay ? today.getMonth() : today.getMonth() - 1
  const closeYear =
    rawCloseMonth < 0 ? today.getFullYear() - 1 : today.getFullYear()
  const closeMonth = ((rawCloseMonth % 12) + 12) % 12
  const start = new Date(closeYear, closeMonth, closingDay + 1)
  const end = new Date(closeYear, closeMonth + 1, closingDay)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function sumBillsDueInNextDays(bills: RecurringBill[], today: Date, days: number): number {
  let total = 0
  for (const bill of bills) {
    if (!bill.active) continue
    for (let i = 0; i <= days; i++) {
      const candidate = new Date(today)
      candidate.setDate(today.getDate() + i)
      if (candidate.getDate() === bill.dueDay) {
        total += bill.amount
        break
      }
    }
  }
  return total
}

export function computeDashboard(
  transactions: Transaction[],
  categories: Category[],
  accounts: BankAccount[],
  csvImports: CsvImport[],
  recurringBills: RecurringBill[],
  selectedMonth?: string,
  plan?: FinancialPlan | null,
): DashboardData {
  const now = new Date()
  const calendarKey = monthKey(now)

  const availableMonths = [...new Set(transactions.map((t) => t.date.substring(0, 7)))]
    .sort()
    .reverse()

  // Default to most recent month with data so the dashboard isn't blank when
  // the current calendar month has no imported transactions yet.
  const smartDefault = availableMonths.includes(calendarKey)
    ? calendarKey
    : (availableMonths[0] ?? calendarKey)
  const currentMonth = selectedMonth ?? smartDefault

  if (!availableMonths.includes(currentMonth) && availableMonths.length > 0) {
    availableMonths.unshift(currentMonth)
  }

  const [year, month] = currentMonth.split("-").map(Number)
  const currentDate = new Date(year, month - 1, 1)
  const monthLabel = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth))

  let expenses = 0
  let income = 0
  let essentialReal = 0
  let nonEssentialReal = 0
  const buckets = new Map<string, number>()

  for (const t of monthTx) {
    if (t.type === "income") {
      income += t.amount
      continue
    }
    const cat = t.categoryId ? categoryById.get(t.categoryId) : null
    if (cat?.type === "income") continue
    expenses += t.amount
    const key = t.categoryId ?? "none"
    buckets.set(key, (buckets.get(key) ?? 0) + t.amount)

    if (cat?.type === "essential") essentialReal += t.amount
    else if (cat?.type === "non_essential") nonEssentialReal += t.amount
  }

  const pctBase = plan?.simulationIncome ?? (expenses > 0 ? expenses : null)
  const byCategory: CategorySlice[] = [...buckets.entries()]
    .map(([key, total]) => {
      const cat = key === "none" ? null : categoryById.get(key)
      return {
        id: key,
        name: cat?.name ?? UNCATEGORIZED.name,
        color: cat?.color ?? UNCATEGORIZED.color,
        icon: cat?.icon ?? UNCATEGORIZED.icon,
        type: cat?.type ?? "non_essential",
        total,
        pct: pctBase ? (total / pctBase) * 100 : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  const byMonth: MonthBar[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const key = monthKey(d)
    const total = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(key))
      .reduce((sum, t) => sum + t.amount, 0)
    byMonth.push({ key, label: d.toLocaleDateString("pt-BR", { month: "short" }), total })
  }

  const topExpenses = [...monthTx]
    .filter((t) => t.type === "expense" && t.accountType === "credit")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 7)

  const planVsReal: PlanVsReal | null = plan?.simulationIncome
    ? {
        monthlyIncome: plan.simulationIncome,
        essential: {
          planned: Math.round((plan.essentialPct / 100) * plan.simulationIncome),
          real: essentialReal,
        },
        nonEssential: {
          planned: Math.round((plan.nonEssentialPct / 100) * plan.simulationIncome),
          real: nonEssentialReal,
        },
        patrimonyPlanned: Math.round((plan.patrimonyPct / 100) * plan.simulationIncome),
      }
    : null

  // Build import→account map for credit bill calculation
  const importIdsByAccountId = new Map<string, Set<string>>()
  for (const imp of csvImports) {
    if (!imp.bankAccountId) continue
    const ids = importIdsByAccountId.get(imp.bankAccountId) ?? new Set()
    ids.add(imp.id)
    importIdsByAccountId.set(imp.bankAccountId, ids)
  }

  const accountCards: AccountCard[] = accounts.map((account) => {
    if (account.type === "checking") {
      return {
        id: account.id,
        name: account.name,
        bank: account.bank,
        type: "checking",
        balanceCents: account.balance,
        updatedAtIso: account.updatedAt.toISOString(),
        cycleBill: 0,
        cycleStart: now.toISOString().slice(0, 10),
        cycleEnd: now.toISOString().slice(0, 10),
        daysUntilClose: 0,
        isPastCycle: false,
      }
    }

    const closingDay = account.closingDay ?? 26
    const cycle = getBillingCycle(closingDay, now)
    const accountImportIds = importIdsByAccountId.get(account.id) ?? new Set()

    function sumCreditTxInRange(start: string, end: string): number {
      return transactions
        .filter((t) => {
          if (t.type !== "expense" || t.date < start || t.date > end) return false
          // Prefer FK-based matching; fall back to bank+accountType for pre-feature imports
          if (accountImportIds.size > 0) {
            return t.importId !== null && accountImportIds.has(t.importId)
          }
          return t.bank === account.bank && t.accountType === "credit"
        })
        .reduce((sum, t) => sum + t.amount, 0)
    }

    let cycleBill = sumCreditTxInRange(cycle.start, cycle.end)
    let displayCycle = cycle

    // When the current cycle has no data, show the most recently closed cycle so
    // the card is useful even before the user imports the latest statement.
    if (cycleBill === 0) {
      const cycleStartDate = new Date(cycle.start)
      const dayBeforeStart = new Date(cycleStartDate)
      dayBeforeStart.setDate(dayBeforeStart.getDate() - 1)
      const prevCycle = getBillingCycle(closingDay, dayBeforeStart)
      const prevBill = sumCreditTxInRange(prevCycle.start, prevCycle.end)
      if (prevBill > 0) {
        cycleBill = prevBill
        displayCycle = prevCycle
      }
    }

    const cycleEndDate = new Date(displayCycle.end)
    cycleEndDate.setDate(cycleEndDate.getDate() + 1)
    const daysUntilClose = Math.max(
      0,
      Math.ceil((cycleEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    )

    return {
      id: account.id,
      name: account.name,
      bank: account.bank,
      type: "credit",
      balanceCents: account.balance,
      updatedAtIso: account.updatedAt.toISOString(),
      cycleBill,
      cycleStart: displayCycle.start,
      cycleEnd: displayCycle.end,
      daysUntilClose,
      isPastCycle: displayCycle !== cycle,
    }
  })

  const checkingCards = accountCards.filter((a) => a.type === "checking")
  const planningWidget: PlanningWidget | null =
    checkingCards.length === 0
      ? null
      : {
          checkingTotal: checkingCards.reduce((sum, a) => sum + a.balanceCents, 0),
          billsDueThisWeek: sumBillsDueInNextDays(recurringBills, now, 7),
          available:
            checkingCards.reduce((sum, a) => sum + a.balanceCents, 0) -
            sumBillsDueInNextDays(recurringBills, now, 7),
        }

  return {
    currentMonth,
    monthLabel,
    availableMonths,
    expenses,
    income,
    balance: income - expenses,
    byCategory,
    byMonth,
    topExpenses,
    planVsReal,
    hasData: transactions.length > 0,
    accountCards,
    planningWidget,
  }
}
