"use client"

import { useState } from "react"
import { toast } from "sonner"
import { saveFinancialPlan } from "@/app/(app)/configuracoes/actions"
import type { FinancialPlan } from "@/db/app-schema"
import { parseBrAmount } from "@/utils/csv"
import { maskCurrencyInput } from "@/utils/format"
import { DEFAULTS, GROUPS, type GroupKey } from "./plan-constants"
import { PlanSimulation } from "./plan-simulation"
import { PlanSlidersCard } from "./plan-sliders-card"

export function FinancialPlanningView({ plan }: { plan: FinancialPlan | null }) {
  const [values, setValues] = useState<Record<GroupKey, number>>({
    essentialPct: plan?.essentialPct ?? DEFAULTS.essentialPct,
    nonEssentialPct: plan?.nonEssentialPct ?? DEFAULTS.nonEssentialPct,
    patrimonyPct: plan?.patrimonyPct ?? DEFAULTS.patrimonyPct,
  })
  const [income, setIncome] = useState(
    plan?.simulationIncome ? maskCurrencyInput(String(plan.simulationIncome)) : "",
  )
  const [saving, setSaving] = useState(false)

  const total = values.essentialPct + values.nonEssentialPct + values.patrimonyPct
  const isValid = total === 100
  const diff = 100 - total
  const incomeCents = parseBrAmount(income)

  function setGroup(key: GroupKey, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    const cents = parseBrAmount(income)
    const result = await saveFinancialPlan({
      ...values,
      simulationIncome: cents !== null && cents > 0 ? cents : null,
    })
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Planejamento salvo")
  }

  return (
    <div className="flex gap-4">
      <PlanSlidersCard
        values={values}
        income={income}
        isValid={isValid}
        saving={saving}
        onIncomeChange={setIncome}
        onGroupChange={setGroup}
        onReset={() => setValues({ ...DEFAULTS })}
        onSave={handleSave}
      />
      <PlanSimulation
        values={values}
        incomeCents={incomeCents}
        total={total}
        isValid={isValid}
        diff={diff}
      />
    </div>
  )
}

export type { GroupKey }
export { GROUPS }
