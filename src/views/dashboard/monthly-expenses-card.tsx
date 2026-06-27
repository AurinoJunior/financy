import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DashboardData } from "@/lib/dashboard"
import { formatBRL } from "@/lib/format"

export function MonthlyExpensesCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Gastos por mês</CardTitle>
        <CardDescription>Últimos 8 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ total: { label: "Gastos", color: "var(--color-primary)" } }}
          className="h-44 w-full"
        >
          <LineChart data={data.byMonth} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 14, fill: "var(--color-muted-foreground)" }}
              tickMargin={8}
              className="capitalize"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 14, fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v) => {
                const r = v / 100
                return r >= 1000
                  ? `${(r / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`
                  : r.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
              }}
              tickMargin={8}
              width={50}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent formatter={(value) => formatBRL(value as number)} />
              }
            />
            <Line
              dataKey="total"
              type="monotone"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
