"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { formatBRL, formatDateBr } from "@/utils/format"
import { BankIcon } from "@/views/transactions/bank-icon"
import type { AccountCard } from "./data"

export function CreditCard({ account }: { account: AccountCard }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BankIcon bank={account.bank} size={28} />
          <div>
            <CardDescription className="text-xs">Cartão de crédito</CardDescription>
            <p className="text-sm font-medium leading-none">{account.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-black tabular-nums text-red-400">
          {formatBRL(account.cycleBill)}
        </p>
        {account.isPastCycle ? (
          <p className="mt-1 text-xs text-muted-foreground">
            última fatura · fechou {formatDateBr(account.cycleEnd)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            fatura atual · fecha {formatDateBr(account.cycleEnd)} ({account.daysUntilClose}{" "}
            {account.daysUntilClose === 1 ? "dia" : "dias"})
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          Limite: {formatBRL(account.balanceCents)}
        </p>
      </CardContent>
    </Card>
  )
}
