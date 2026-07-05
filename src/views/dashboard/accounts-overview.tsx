"use client"

import { Settings2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckingCard } from "./checking-card"
import { CreditCard } from "./credit-card"
import type { DashboardData } from "./data"

export function AccountsOverview({ data }: { data: DashboardData }) {
  if (data.accountCards.length === 0) {
    return (
      <Card className="items-center gap-3 py-10 text-center">
        <p className="font-medium">Nenhuma conta cadastrada</p>
        <p className="text-sm text-muted-foreground">
          Cadastre suas contas para ver saldos e planejar seus gastos.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/configuracoes" />}
        >
          <Settings2Icon className="size-3.5" />
          Configurar contas
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.accountCards.map((account) =>
          account.type === "checking" ? (
            <CheckingCard key={account.id} account={account} />
          ) : (
            <CreditCard key={account.id} account={account} />
          ),
        )}
      </div>
    </div>
  )
}
