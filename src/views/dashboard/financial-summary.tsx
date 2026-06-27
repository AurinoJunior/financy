import { ArrowDownLeftIcon, ArrowUpRightIcon, WalletIcon } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/views/dashboard/data"
import { formatBRL } from "@/utils/format"
import { cn } from "@/utils/cn"

export function FinancialSummary({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Entradas"
        value={formatBRL(data.income)}
        icon={<ArrowDownLeftIcon className="size-4" />}
        tone="income"
      />
      <SummaryCard
        label="Saídas"
        value={formatBRL(data.expenses)}
        icon={<ArrowUpRightIcon className="size-4" />}
        tone="expense"
      />
      <SummaryCard
        label="Saldo"
        value={formatBRL(data.balance)}
        icon={<WalletIcon className="size-4" />}
        tone={data.balance < 0 ? "negative" : "balance"}
      />
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
  tone: "income" | "expense" | "balance" | "negative"
}) {
  const iconClass = cn("flex size-7 items-center justify-center rounded-lg", {
    "bg-emerald-500/15 text-emerald-400": tone === "income",
    "bg-red-500/15 text-red-400": tone === "expense" || tone === "negative",
    "bg-blue-500/15 text-blue-400": tone === "balance",
  })

  const labelClass = cn({
    "text-emerald-400": tone === "income",
    "text-red-400": tone === "expense" || tone === "negative",
    "text-blue-400": tone === "balance",
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className={labelClass}>{label}</CardDescription>
          <span className={iconClass}>{icon}</span>
        </div>
        <CardTitle className="text-2xl font-black">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
