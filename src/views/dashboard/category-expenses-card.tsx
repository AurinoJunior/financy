"use client"

import { useState } from "react"
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { FilterSelect } from "@/components/ui/filter-select"
import { CATEGORY_TYPE_LABELS } from "@/constants/categories"
import { formatBRL } from "@/utils/format"
import type { CategorySlice, DashboardData } from "@/views/dashboard/data"

type TypeFilter = "all" | "essential" | "non_essential"

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "essential", label: CATEGORY_TYPE_LABELS.essential },
  { value: "non_essential", label: CATEGORY_TYPE_LABELS.non_essential },
]

export function CategoryExpensesCard({ data }: { data: DashboardData }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")

  const slices =
    typeFilter === "all" ? data.byCategory : data.byCategory.filter((s) => s.type === typeFilter)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Para onde vai meu dinheiro</CardTitle>
          <FilterSelect
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as TypeFilter)}
            options={TYPE_OPTIONS}
            align="end"
          />
        </div>
        <CardDescription>Gastos do mês por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        {slices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum gasto neste mês.</p>
        ) : (
          <CategoryBarChart slices={slices} planVsReal={data.planVsReal} />
        )}
      </CardContent>
    </Card>
  )
}

function CategoryBarChart({
  slices,
  planVsReal,
}: {
  slices: CategorySlice[]
  planVsReal: DashboardData["planVsReal"]
}) {
  const chartData = slices.slice(0, 11).map((s) => ({
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
                return `${formatBRL(value as number)}${planVsReal && pct != null ? ` · ${pct.toFixed(0)}%` : ""}`
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
