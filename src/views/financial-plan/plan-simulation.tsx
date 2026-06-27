import { formatBRL } from "@/utils/format"
import { cn } from "@/utils/cn"
import { GROUPS, type GroupKey } from "./plan-constants"

export function PlanSimulation({
  values,
  incomeCents,
  total,
  isValid,
  diff,
}: {
  values: Record<GroupKey, number>
  incomeCents: number | null
  total: number
  isValid: boolean
  diff: number
}) {
  return (
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
  )
}
