import { create } from "zustand"

export const PERIODS = ["all", "this_month", "last_month", "last_3_months"] as const
export type Period = (typeof PERIODS)[number]

export const PERIOD_LABELS: Record<Period, string> = {
  all: "Todo período",
  this_month: "Este mês",
  last_month: "Mês passado",
  last_3_months: "Últimos 3 meses",
}

type TransactionFiltersState = {
  period: Period
  categoryId: string // "all" | "none" | <id>
  setPeriod: (period: Period) => void
  setCategoryId: (categoryId: string) => void
}

export const useTransactionFilters = create<TransactionFiltersState>((set) => ({
  period: "all",
  categoryId: "all",
  setPeriod: (period) => set({ period }),
  setCategoryId: (categoryId) => set({ categoryId }),
}))
