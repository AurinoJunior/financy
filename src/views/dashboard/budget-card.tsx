import { Settings2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/views/dashboard/data"
import { formatBRL } from "@/utils/format"
import { cn } from "@/utils/cn"

export function BudgetCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Orçamento do mês</CardTitle>
        <CardDescription>
          {data.planVsReal
            ? `Base: ${formatBRL(data.planVsReal.monthlyIncome)}/mês`
            : "Configure sua renda para ativar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data.planVsReal ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Defina sua renda mensal no planejamento financeiro para comparar o planejado com o
              real.
            </p>
            <Button variant="outline" size="sm" render={<Link href="/configuracoes" />}>
              <Settings2Icon className="size-3.5" />
              Configurar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <PlanGroup
              label="Essencial"
              planned={data.planVsReal.essential.planned}
              real={data.planVsReal.essential.real}
            />
            <PlanGroup
              label="Não essencial"
              planned={data.planVsReal.nonEssential.planned}
              real={data.planVsReal.nonEssential.real}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlanGroup({ label, planned, real }: { label: string; planned: number; real: number }) {
  const rawPct = planned > 0 ? (real / planned) * 100 : 0
  const pct = Math.min(rawPct, 100)

  const barColor =
    rawPct >= 95
      ? "var(--color-destructive)"
      : rawPct >= 70
        ? "oklch(0.75 0.18 60)"
        : "var(--color-primary)"

  const valueColor =
    rawPct >= 95 ? "text-destructive" : rawPct >= 70 ? "text-orange-400" : "text-muted-foreground"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className={cn("tabular-nums", valueColor)}>
          {formatBRL(real)}
          <span className="text-muted-foreground"> / {formatBRL(planned)}</span>
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
