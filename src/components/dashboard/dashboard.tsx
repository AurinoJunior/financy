"use client"

import { ArrowDownLeftIcon, ArrowUpRightIcon, Settings2Icon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, Cell, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"
import { MonthSelector } from "@/components/dashboard/month-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DashboardData } from "@/lib/dashboard"
import { formatBRL, formatDateBr } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Dashboard({ data }: { data: DashboardData }) {
  if (!data.hasData) {
    return (
      <Card className="items-center gap-3 py-16 text-center">
        <WalletIcon className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Ainda não há dados</p>
          <p className="text-sm text-muted-foreground">
            Importe um extrato para descobrir para onde vai o seu dinheiro.
          </p>
        </div>
        <Button render={<Link href="/transacoes" />}>Importar CSV</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <MonthSelector availableMonths={data.availableMonths} currentMonth={data.currentMonth} />
      </div>

      {/* Topo: resumo financeiro */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Entradas"
          value={formatBRL(data.income)}
          icon={<ArrowDownLeftIcon className="size-4" />}
          tone="primary"
        />
        <SummaryCard
          label="Saídas"
          value={formatBRL(data.expenses)}
          icon={<ArrowUpRightIcon className="size-4" />}
          tone="default"
        />
        <SummaryCard
          label="Saldo"
          value={formatBRL(data.balance)}
          icon={<WalletIcon className="size-4" />}
          tone={data.balance < 0 ? "negative" : "default"}
        />
      </div>

      {/* Bento principal: 3 colunas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Gastos por categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Para onde vai meu dinheiro</CardTitle>
              <CardDescription>Gastos do mês por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {data.byCategory.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum gasto neste mês.
                </p>
              ) : (
                <CategoryBarChart data={data} />
              )}
            </CardContent>
          </Card>

          {/* Gastos por mês */}
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
                <LineChart data={data.byMonth} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    className="capitalize"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(v) => {
                      const r = v / 100
                      return r >= 1000
                        ? `${(r / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`
                        : r.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
                    }}
                    width={42}
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
        </div>

        {/* Coluna direita 1/3 */}
        <div className="space-y-6">
          {/* Planejado vs Real */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Planejado vs Real</CardTitle>
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
                    Defina sua renda mensal no planejamento financeiro para comparar o planejado com
                    o real.
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
                    color="oklch(0.87 0.21 128)"
                  />
                  <PlanGroup
                    label="Não essencial"
                    planned={data.planVsReal.nonEssential.planned}
                    real={data.planVsReal.nonEssential.real}
                    color="oklch(0.75 0.18 60)"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 7 mais caros no crédito */}
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
        </div>
      </div>
    </div>
  )
}

function PlanGroup({
  label,
  planned,
  real,
  color,
}: {
  label: string
  planned: number
  real: number
  color: string
}) {
  const pct = planned > 0 ? Math.min((real / planned) * 100, 100) : 0
  const over = real > planned

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className={cn("tabular-nums", over ? "text-destructive" : "text-muted-foreground")}>
          {formatBRL(real)}
          <span className="text-muted-foreground"> / {formatBRL(planned)}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", over && "bg-destructive")}
          style={{
            width: `${pct}%`,
            backgroundColor: over ? undefined : color,
          }}
        />
      </div>
    </div>
  )
}

function CategoryBarChart({ data }: { data: DashboardData }) {
  const chartData = data.byCategory.slice(0, 10).map((s) => ({
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
            style={{ fill: "white", fontSize: 12 }}
          />
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: "default" | "primary" | "negative"
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              tone === "primary" && "bg-primary/15 text-primary",
              tone === "negative" && "bg-destructive/15 text-destructive",
              tone === "default" && "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
        </div>
        <CardTitle className={cn("text-2xl", tone === "negative" && "text-destructive")}>
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
