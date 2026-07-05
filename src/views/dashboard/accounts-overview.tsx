"use client"

import { CheckIcon, PencilIcon, Settings2Icon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { updateCheckingBalance } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils/cn"
import { parseBrAmount } from "@/utils/csv"
import { formatBRL, formatDateBr, formatRelativeTime, maskCurrencyInput } from "@/utils/format"
import { BankIcon } from "@/views/transactions/bank-icon"
import type { AccountCard, DashboardData } from "./data"

export function AccountsOverview({ data }: { data: DashboardData }) {
  if (data.accountCards.length === 0) {
    return (
      <Card className="items-center gap-3 py-10 text-center">
        <p className="font-medium">Nenhuma conta cadastrada</p>
        <p className="text-sm text-muted-foreground">
          Cadastre suas contas para ver saldos e planejar seus gastos.
        </p>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/configuracoes" />}>
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

      {data.planningWidget && <PlanningWidgetCard widget={data.planningWidget} />}
    </div>
  )
}

function CheckingCard({ account }: { account: AccountCard }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setInputValue(
      (account.balanceCents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    )
    setEditing(true)
  }

  async function save() {
    const cents = parseBrAmount(inputValue)
    if (cents === null || cents < 0) {
      toast.error("Valor inválido")
      return
    }
    setSaving(true)
    const result = await updateCheckingBalance(account.id, Math.round(Math.abs(cents)))
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setEditing(false)
    toast.success("Saldo atualizado")
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BankIcon bank={account.bank} size={28} />
            <div>
              <CardDescription className="text-xs">Conta corrente</CardDescription>
              <p className="text-sm font-medium leading-none">{account.name}</p>
            </div>
          </div>
          {!editing && (
            <Button variant="ghost" size="icon-sm" onClick={startEdit} aria-label="Editar saldo">
              <PencilIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(maskCurrencyInput(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") save()
                if (e.key === "Escape") setEditing(false)
              }}
              className="h-8 text-base font-bold"
            />
            <Button variant="ghost" size="icon-sm" onClick={save} disabled={saving}>
              <CheckIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        ) : (
          <p className="text-2xl font-black tabular-nums">{formatBRL(account.balanceCents)}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          atualizado {formatRelativeTime(new Date(account.updatedAtIso))}
        </p>
      </CardContent>
    </Card>
  )
}

function CreditCard({ account }: { account: AccountCard }) {
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

function PlanningWidgetCard({ widget }: { widget: DashboardData["planningWidget"] }) {
  if (!widget) return null
  const isPositive = widget.available >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Disponível esta semana</CardTitle>
        <CardDescription className="text-xs">
          Saldo em conta menos contas com vencimento nos próximos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-black tabular-nums",
            isPositive ? "text-emerald-400" : "text-red-400",
          )}
        >
          {formatBRL(widget.available)}
        </p>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Saldo em conta</span>
            <span>{formatBRL(widget.checkingTotal)}</span>
          </div>
          {widget.billsDueThisWeek > 0 && (
            <div className="flex justify-between">
              <span>Contas a vencer</span>
              <span className="text-red-400">-{formatBRL(widget.billsDueThisWeek)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
