"use client"

import { RotateCcwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { saveFinancialPlan } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FinancialPlan } from "@/db/app-schema"
import { parseBrAmount } from "@/lib/csv"
import { formatBRL, maskCurrencyInput } from "@/lib/format"
import { cn } from "@/lib/utils"

const DEFAULTS = { essentialPct: 50, nonEssentialPct: 30, patrimonyPct: 20 } as const

const GROUPS = [
  {
    key: "essentialPct" as const,
    label: "Essencial",
    color: "text-primary",
  },
  {
    key: "nonEssentialPct" as const,
    label: "Não essencial",
    color: "text-orange-400",
  },
  {
    key: "patrimonyPct" as const,
    label: "Patrimônio",
    color: "text-emerald-400",
  },
] as const

type GroupKey = (typeof GROUPS)[number]["key"]

interface Props {
  plan: FinancialPlan | null
}

export function FinancialPlanningView({ plan }: Props) {
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
      {/* Sliders — 60% */}
      <Card className="flex-3">
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="simulation-income" className="text-sm font-medium text-white">
              Renda mensal
            </label>
            <div className="glass-blur flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 shadow-[0_4px_16px_oklch(0_0_0/0.3),inset_0_1px_0_oklch(1_0_0/0.07)]">
              <span className="shrink-0 text-sm text-muted-foreground">R$</span>
              <input
                id="simulation-income"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={income}
                onChange={(e) => setIncome(maskCurrencyInput(e.target.value))}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-5">
            {GROUPS.map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-medium text-white">{label}</span>
                  </div>
                  <span className={cn("text-base font-bold tabular-nums", color)}>
                    {values[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={values[key]}
                  onChange={(e) => setGroup(key, Number(e.target.value))}
                  className="financial-slider w-full"
                  style={{
                    background: `linear-gradient(to right, oklch(0.87 0.21 128) ${values[key]}%, oklch(1 0 0 / 0.12) ${values[key]}%)`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setValues({ ...DEFAULTS })}
              aria-label="Restaurar padrões 50/30/20"
              title="Restaurar padrões 50/30/20"
            >
              <RotateCcwIcon />
            </Button>
            <Button onClick={handleSave} disabled={!isValid || saving}>
              {saving ? "Salvando..." : "Salvar planejamento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulação — 40% */}
      <div className="flex flex-2 flex-col space-y-5">
        {incomeCents !== null && incomeCents > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-3 border-b border-border bg-white/5 px-3 py-2.5">
              <span className="font-medium text-muted-foreground">Grupo</span>
              <span className="text-center font-medium text-muted-foreground">Meta</span>
              <span className="text-right font-medium text-muted-foreground">Simulação</span>
            </div>
            {GROUPS.map(({ key, label, color }) => (
              <div
                key={key}
                className="grid grid-cols-3 items-center border-b border-border px-3 py-3 last:border-b-0"
              >
                <span className="text-sm">{label}</span>
                <span className={cn("text-center text-sm font-semibold tabular-nums", color)}>
                  {values[key]}%
                </span>
                <span className="text-right text-sm font-semibold tabular-nums text-white">
                  {formatBRL(Math.round((incomeCents * values[key]) / 100))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-muted-foreground text-center">
            Informe sua renda para ver a simulação.
          </p>
        )}

        <div
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
            isValid
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400",
          )}
        >
          <span>Total alocado</span>
          <span>
            {total}% {isValid ? "✓" : diff > 0 ? `(faltam ${diff}%)` : `(excesso de ${-diff}%)`}
          </span>
        </div>
      </div>
    </div>
  )
}
