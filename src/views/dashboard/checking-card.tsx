"use client"

import { CheckIcon, PencilIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { updateCheckingBalance } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { parseBrAmount } from "@/utils/csv"
import { formatBRL, formatRelativeTime, maskCurrencyInput } from "@/utils/format"
import { BankIcon } from "@/views/transactions/bank-icon"
import type { AccountCard } from "./data"

export function CheckingCard({ account }: { account: AccountCard }) {
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
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(false)} disabled={saving}>
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
