import type { Category, RecurringBill, Transaction } from "@/db/app-schema"

export type CategorySlice = {
  id: string
  name: string
  color: string
  icon: string
  total: number
  pct: number
}

export type MonthBar = { key: string; label: string; total: number }

export type DashboardData = {
  currentMonth: string
  monthLabel: string
  availableMonths: string[]
  expenses: number
  income: number
  balance: number
  recurringEssential: number
  recurringNonEssential: number
  recurringTotal: number
  byCategory: CategorySlice[]
  byMonth: MonthBar[]
  recent: Transaction[]
  hasData: boolean
}

const UNCATEGORIZED: Pick<CategorySlice, "name" | "color" | "icon"> = {
  name: "Sem categoria",
  color: "#64748b",
  icon: "other",
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function computeDashboard(
  transactions: Transaction[],
  bills: RecurringBill[],
  categories: Category[],
  selectedMonth?: string,
): DashboardData {
  const now = new Date()
  const defaultKey = monthKey(now)
  const currentMonth = selectedMonth ?? defaultKey

  const [year, month] = currentMonth.split("-").map(Number)
  const currentDate = new Date(year, month - 1, 1)
  const monthLabel = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const availableMonths = [...new Set(transactions.map((t) => t.date.substring(0, 7)))]
    .sort()
    .reverse()

  if (!availableMonths.includes(currentMonth) && availableMonths.length > 0) {
    availableMonths.unshift(currentMonth)
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth))

  let expenses = 0
  let income = 0
  const buckets = new Map<string, number>()
  for (const t of monthTx) {
    if (t.type === "income") {
      income += t.amount
      continue
    }
    expenses += t.amount
    const key = t.categoryId ?? "none"
    buckets.set(key, (buckets.get(key) ?? 0) + t.amount)
  }

  const byCategory: CategorySlice[] = [...buckets.entries()]
    .map(([key, total]) => {
      const cat = key === "none" ? null : categoryById.get(key)
      return {
        id: key,
        name: cat?.name ?? UNCATEGORIZED.name,
        color: cat?.color ?? UNCATEGORIZED.color,
        icon: cat?.icon ?? UNCATEGORIZED.icon,
        total,
        pct: expenses > 0 ? (total / expenses) * 100 : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  // Últimos 6 meses a partir do mês selecionado (do mais antigo ao atual).
  const byMonth: MonthBar[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const key = monthKey(d)
    const total = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(key))
      .reduce((sum, t) => sum + t.amount, 0)
    byMonth.push({ key, label: d.toLocaleDateString("pt-BR", { month: "short" }), total })
  }

  let recurringEssential = 0
  let recurringNonEssential = 0
  for (const b of bills) {
    if (!b.active) continue
    if (b.essential) recurringEssential += b.amount
    else recurringNonEssential += b.amount
  }

  const recentInMonth = [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return {
    currentMonth,
    monthLabel,
    availableMonths,
    expenses,
    income,
    balance: income - expenses,
    recurringEssential,
    recurringNonEssential,
    recurringTotal: recurringEssential + recurringNonEssential,
    byCategory,
    byMonth,
    recent: recentInMonth,
    hasData: transactions.length > 0,
  }
}
