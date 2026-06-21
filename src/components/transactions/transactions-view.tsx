"use client"

import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { categorizeUncategorized, deleteTransaction } from "@/app/(app)/transacoes/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FilterSelect } from "@/components/ui/filter-select"
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

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}

export function TransactionsView({
  transactions,
  categories,
}: {
  transactions: Transaction[]
  categories: Category[]
}) {
  const PAGE_SIZE = 15

  const { period, categoryId, setPeriod, setCategoryId } = useTransactionFilters()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categorizing, setCategorizing] = useState(false)
  const [page, setPage] = useState(1)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [period, categoryId])

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

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
            <FilterSelect
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              options={PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
            />

            <FilterSelect
              value={categoryId}
              onChange={setCategoryId}
              options={[
                { value: "all", label: "Todas as categorias" },
                { value: "none", label: "Sem categoria" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />

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
              paginated.map((t) => (
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
              ))
            )}
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-base text-white">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeftIcon />
                </Button>

                {getPageNumbers(safePage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={i < totalPages / 2 ? "ellipsis-left" : "ellipsis-right"}
                      className="px-1"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPage(p)}
                      className={cn(safePage === p && "bg-white/8 text-foreground")}
                    >
                      {p}
                    </Button>
                  ),
                )}

                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Próxima página"
                >
                  <ChevronRightIcon />
                </Button>
              </div>

              <span>
                mostrando {Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
