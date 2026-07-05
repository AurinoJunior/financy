"use client"

import type { Category, FinancialPlan } from "@/db/app-schema"
import { CategoriesView } from "@/views/configuracoes/categories/categories-view"
import { FinancialPlanningView } from "@/views/configuracoes/financial-plan/financial-planning-view"

export function ConfiguracoesView({
  categories,
  plan,
}: {
  categories: Category[]
  plan: FinancialPlan | null
}) {
  return (
    <div className="space-y-12">
      <CategoriesView categories={categories} />
      <FinancialPlanningView plan={plan} />
    </div>
  )
}
