import type { Category, FinancialPlan, Transaction } from "@/db/app-schema"

export type CategorySlice = {
  id: string
  name: string
  color: string
  icon: string
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
  categories: Category[],
  selectedMonth?: string,
  plan?: FinancialPlan | null,
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
  let essentialReal = 0
  let nonEssentialReal = 0
  const buckets = new Map<string, number>()

  for (const t of monthTx) {
    if (t.type === "income") {
      income += t.amount
      continue
    }
    expenses += t.amount
    const key = t.categoryId ?? "none"
    buckets.set(key, (buckets.get(key) ?? 0) + t.amount)

    if (t.categoryId) {
      const cat = categoryById.get(t.categoryId)
      if (cat?.type === "essential") essentialReal += t.amount
      else if (cat?.type === "non_essential") nonEssentialReal += t.amount
    }
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
  }
}
