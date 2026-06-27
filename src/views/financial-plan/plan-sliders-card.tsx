import { RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { maskCurrencyInput } from "@/utils/format"
import { cn } from "@/utils/cn"
import { GROUPS, type GroupKey } from "./plan-constants"

export function PlanSlidersCard({
  values,
  income,
  isValid,
  saving,
  onIncomeChange,
  onGroupChange,
  onReset,
  onSave,
}: {
  values: Record<GroupKey, number>
  income: string
  isValid: boolean
  saving: boolean
  onIncomeChange: (v: string) => void
  onGroupChange: (key: GroupKey, v: number) => void
  onReset: () => void
  onSave: () => void
}) {
  return (
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
              onChange={(e) => onIncomeChange(maskCurrencyInput(e.target.value))}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-5">
          {GROUPS.map(({ key, label, color }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-medium text-white">{label}</span>
                <span className={cn("text-base font-bold tabular-nums", color)}>{values[key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={values[key]}
                onChange={(e) => onGroupChange(key, Number(e.target.value))}
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
            onClick={onReset}
            aria-label="Restaurar padrões 50/30/20"
            title="Restaurar padrões 50/30/20"
          >
            <RotateCcwIcon />
          </Button>
          <Button onClick={onSave} disabled={!isValid || saving}>
            {saving ? "Salvando..." : "Salvar planejamento"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
