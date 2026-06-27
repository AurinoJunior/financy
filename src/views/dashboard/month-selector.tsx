"use client"

import { useRouter } from "next/navigation"
import { FilterSelect } from "@/components/ui/filter-select"

function formatMonthLong(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return `${d.toLocaleDateString("pt-BR", { month: "long" })} ${d.getFullYear()}`
}

function formatMonthShort(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return `${d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")} ${d.getFullYear()}`
}

export function MonthSelector({
  availableMonths,
  currentMonth,
}: {
  availableMonths: string[]
  currentMonth: string
}) {
  const router = useRouter()

  return (
    <FilterSelect
      value={currentMonth}
      onChange={(m) => router.push(m === currentMonth ? "/" : `/?month=${m}`)}
      options={availableMonths.map((m) => ({ value: m, label: formatMonthShort(m) }))}
      triggerLabel={formatMonthLong(currentMonth)}
      align="end"
    />
  )
}
