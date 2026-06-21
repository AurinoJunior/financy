"use client"

import { SparklesIcon, Trash2Icon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { categorizeUncategorized, deleteTransaction } from "@/app/(app)/transacoes/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Category, Transaction } from "@/db/app-schema"
import { formatBRL, formatDateBr } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  PERIOD_LABELS,
  PERIODS,
  type Period,
  useTransactionFilters,
} from "@/stores/transaction-filters"
import { CategoryPicker } from "./category-picker"
import { ImportDialog } from "./import-dialog"

function matchesPeriod(dateIso: string, period: Period): boolean {
  if (period === "all") return true
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, "0")
  const monthStart = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`

  if (period === "this_month") return dateIso >= `${y}-${pad(m + 1)}-01`
  if (period === "last_month") {
    return dateIso >= monthStart(new Date(y, m - 1, 1)) && dateIso < `${y}-${pad(m + 1)}-01`
  }
  return dateIso >= monthStart(new Date(y, m - 2, 1)) // last_3_months
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring dark:bg-input/30"

export function TransactionsView({
  transactions,
  categories,
}: {
  transactions: Transaction[]
  categories: Category[]
}) {
  const { period, categoryId, setPeriod, setCategoryId } = useTransactionFilters()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categorizing, setCategorizing] = useState(false)

  const uncategorizedCount = useMemo(
    () => transactions.filter((t) => t.categoryId === null).length,
    [transactions],
  )

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (!matchesPeriod(t.date, period)) return false
      if (categoryId === "all") return true
      if (categoryId === "none") return t.categoryId === null
      return t.categoryId === categoryId
    })
  }, [transactions, period, categoryId])

  const totals = useMemo(() => {
    let expense = 0
    let income = 0
    for (const t of filtered) {
      if (t.type === "expense") expense += t.amount
      else income += t.amount
    }
    return { expense, income }
  }, [filtered])

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteTransaction(id)
    setDeletingId(null)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Transação excluída")
  }

  async function handleCategorize() {
    setCategorizing(true)
    const result = await categorizeUncategorized()
    setCategorizing(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(
      result.count > 0 ? `${result.count} transações categorizadas` : "Nada para categorizar",
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          {uncategorizedCount > 0 && (
            <Button variant="outline" onClick={handleCategorize} disabled={categorizing}>
              <SparklesIcon />
              {categorizing ? "Categorizando..." : `Categorizar com IA (${uncategorizedCount})`}
            </Button>
          )}
          <ImportDialog />
        </div>
      </div>

      {transactions.length === 0 ? (
        <Card className="items-center gap-2 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma transação ainda. Importe um CSV para começar.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Período"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className={selectClass}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {PERIOD_LABELS[p]}
                </option>
              ))}
            </select>

            <select
              aria-label="Categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="all">Todas as categorias</option>
              <option value="none">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "transação" : "transações"}
              </span>
              <span className="font-medium">Gastos: {formatBRL(totals.expense)}</span>
              {totals.income > 0 && (
                <span className="font-medium text-primary">
                  Entradas: {formatBRL(totals.income)}
                </span>
              )}
            </div>
          </div>

          <Card className="gap-0 py-0">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhuma transação para esse filtro.
              </p>
            ) : (
              filtered.map((t) => {
                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      {formatDateBr(t.date)}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{t.description}</span>

                    <CategoryPicker
                      transactionId={t.id}
                      categoryId={t.categoryId}
                      categories={categories}
                    />

                    <span
                      className={cn(
                        "w-24 shrink-0 text-right text-sm font-semibold tabular-nums",
                        t.type === "income" && "text-primary",
                      )}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {formatBRL(t.amount)}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Excluir"
                      disabled={deletingId === t.id}
                      onClick={() => handleDelete(t.id)}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                )
              })
            )}
          </Card>
        </>
      )}
    </div>
  )
}
