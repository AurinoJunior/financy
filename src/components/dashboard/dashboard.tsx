import { ArrowDownLeftIcon, ArrowUpRightIcon, RepeatIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { MonthSelector } from "@/components/dashboard/month-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategoryIcon } from "@/lib/categories"
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

  const maxMonth = Math.max(...data.byMonth.map((m) => m.total), 1)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <MonthSelector availableMonths={data.availableMonths} currentMonth={data.currentMonth} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Gasto no mês"
          value={formatBRL(data.expenses)}
          icon={<ArrowUpRightIcon className="size-4" />}
          tone="default"
        />
        <SummaryCard
          label="Entradas no mês"
          value={formatBRL(data.income)}
          icon={<ArrowDownLeftIcon className="size-4" />}
          tone="primary"
        />
        <SummaryCard
          label="Saldo"
          value={formatBRL(data.balance)}
          icon={<WalletIcon className="size-4" />}
          tone={data.balance < 0 ? "negative" : "default"}
        />
        <SummaryCard
          label="Recorrentes / mês"
          value={formatBRL(data.recurringTotal)}
          icon={<RepeatIcon className="size-4" />}
          tone="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Para onde vai meu dinheiro</CardTitle>
              <CardDescription>Gastos do mês por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {data.byCategory.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum gasto neste mês.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.byCategory.map((slice) => {
                    const Icon = getCategoryIcon(slice.icon)
                    return (
                      <div key={slice.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="flex size-5 items-center justify-center rounded-md text-white"
                              style={{ backgroundColor: slice.color }}
                            >
                              <Icon className="size-3" />
                            </span>
                            {slice.name}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatBRL(slice.total)} · {slice.pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${slice.pct}%`, backgroundColor: slice.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos por mês</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-44 items-end justify-between gap-2">
                {data.byMonth.map((m, i) => {
                  const isCurrent = i === data.byMonth.length - 1
                  const heightPct = (m.total / maxMonth) * 100
                  return (
                    <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {m.total > 0 ? formatBRL(m.total).replace("R$", "").trim() : ""}
                      </span>
                      <div className="flex h-full w-full items-end">
                        <div
                          className={cn(
                            "w-full rounded-md transition-all",
                            isCurrent ? "bg-primary" : "bg-primary/20",
                          )}
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs capitalize text-muted-foreground">{m.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recorrentes</CardTitle>
              <CardDescription>Compromissos fixos do mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Essenciais" value={formatBRL(data.recurringEssential)} />
              <Row label="Não essenciais" value={formatBRL(data.recurringNonEssential)} />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={formatBRL(data.recurringTotal)} strong />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transações recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDateBr(t.date)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      t.type === "income" && "text-primary",
                    )}
                  >
                    {t.type === "expense" ? "-" : "+"}
                    {formatBRL(t.amount)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn("text-muted-foreground", strong && "font-medium text-foreground")}>
        {label}
      </span>
      <span className={cn("tabular-nums", strong ? "font-semibold" : "font-medium")}>{value}</span>
    </div>
  )
}
