"use client"

import { WalletIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DashboardData } from "@/views/dashboard/data"
import { MonthSelector } from "./month-selector"
import { BudgetCard } from "./budget-card"
import { CategoryExpensesCard } from "./category-expenses-card"
import { FinancialSummary } from "./financial-summary"
import { MonthlyExpensesCard } from "./monthly-expenses-card"
import { TopExpensesCard } from "./top-expenses-card"

export function Dashboard({ data }: { data: DashboardData }) {
  if (!data.hasData) {
    return (
      <Card className="items-center gap-3 py-16 text-center">
        <WalletIcon className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Ainda não há dados</p>
          <p className="text-sm text-muted-foreground">
            Importe um extrato para descobrir para onde vai o seu dinheiro.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/transacoes" />}>Importar CSV</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <MonthSelector availableMonths={data.availableMonths} currentMonth={data.currentMonth} />
      </div>

      <FinancialSummary data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CategoryExpensesCard data={data} />
          <MonthlyExpensesCard data={data} />
        </div>

        <div className="space-y-6">
          <BudgetCard data={data} />
          <TopExpensesCard data={data} />
        </div>
      </div>
    </div>
  )
}
