"use client"

import type { BankAccount, Category, FinancialPlan } from "@/db/app-schema"
import { CategoriesView } from "@/views/configuracoes/categories/categories-view"
import { FinancialPlanningView } from "@/views/configuracoes/financial-plan/financial-planning-view"
import { BankAccountsView } from "./bank-accounts/bank-accounts-view"

export function ConfiguracoesView({
  categories,
  plan,
  accounts,
}: {
  categories: Category[]
  plan: FinancialPlan | null
  accounts: BankAccount[]
}) {
  return (
    <div className="space-y-12">
      <BankAccountsView accounts={accounts} />
      <CategoriesView categories={categories} />
      <FinancialPlanningView plan={plan} />
    </div>
  )
}
