import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/views/dashboard/data"
import { formatBRL, formatDateBr } from "@/utils/format"

export function TopExpensesCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl mb-4">Maiores gastos no crédito</CardTitle>
      </CardHeader>
      <CardContent>
        {data.topExpenses.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum gasto no crédito neste mês.
          </p>
        ) : (
          <div className="space-y-3">
            {data.topExpenses.map((t, i) => (
              <div key={t.id} className="flex items-start gap-3">
                <span className="w-6 shrink-0 text-center text-xl font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDateBr(t.date)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-red-400">
                  {formatBRL(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
