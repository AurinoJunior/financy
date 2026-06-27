import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DashboardData } from "@/views/dashboard/data"
import { formatBRL } from "@/utils/format"

export function CategoryExpensesCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Para onde vai meu dinheiro</CardTitle>
        <CardDescription>Gastos do mês por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        {data.byCategory.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum gasto neste mês.</p>
        ) : (
          <CategoryBarChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}

function CategoryBarChart({ data }: { data: DashboardData }) {
  const chartData = data.byCategory.slice(0, 10).map((s) => ({
    id: s.id,
    name: s.name,
    total: s.total,
    color: s.color,
    pct: s.pct,
  }))

  const chartConfig = Object.fromEntries(
    chartData.map((s) => [s.name, { label: s.name, color: s.color }]),
  )

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ height: chartData.length * 52 + 8 }}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 6, right: 72, top: 0, bottom: 0 }}
      >
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={126}
          tick={{ fontSize: 14, fill: "white" }}
        />
        <XAxis type="number" hide />
        <ChartTooltip
          cursor={{ fill: "oklch(1 0 0 / 0.05)", radius: 4 }}
          content={
            <ChartTooltipContent
              // biome-ignore lint/suspicious/noExplicitAny: recharts item payload is untyped
              formatter={(value, _name, item: any) => {
                const pct = item?.payload?.pct
                return `${formatBRL(value as number)}${data.planVsReal && pct != null ? ` · ${pct.toFixed(0)}%` : ""}`
              }}
            />
          }
        />
        <Bar dataKey="total" radius={4} barSize={40}>
          <LabelList
            dataKey="total"
            position="right"
            // biome-ignore lint/suspicious/noExplicitAny: recharts label value is untyped
            formatter={(value: any) => formatBRL(Number(value)).replace("R$ ", "").trim()}
            style={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          {chartData.map((entry) => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
