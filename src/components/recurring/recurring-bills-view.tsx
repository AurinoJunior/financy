"use client"

import { CalendarIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { deleteRecurringBill, toggleRecurringBill } from "@/app/(app)/recorrentes/actions"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RecurringBill } from "@/db/app-schema"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useRecurringBillDialog } from "@/stores/recurring-bill-dialog"
import { RecurringBillDialog } from "./recurring-bill-dialog"

export function RecurringBillsView({ bills }: { bills: RecurringBill[] }) {
  const openCreate = useRecurringBillDialog((s) => s.openCreate)
  const openEdit = useRecurringBillDialog((s) => s.openEdit)
  const [deleting, setDeleting] = useState<RecurringBill | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const totals = useMemo(() => {
    let essential = 0
    let nonEssential = 0
    for (const b of bills) {
      if (!b.active) continue
      if (b.essential) essential += b.amount
      else nonEssential += b.amount
    }
    return { essential, nonEssential, total: essential + nonEssential }
  }, [bills])

  const groups = [
    { essential: true, label: "Essenciais", items: bills.filter((b) => b.essential) },
    { essential: false, label: "Não essenciais", items: bills.filter((b) => !b.essential) },
  ]

  async function handleToggle(bill: RecurringBill) {
    setBusyId(bill.id)
    const result = await toggleRecurringBill(bill.id, !bill.active)
    setBusyId(null)
    if (!result.ok) toast.error(result.error)
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusyId(deleting.id)
    const result = await deleteRecurringBill(deleting.id)
    setBusyId(null)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Conta excluída")
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Contas recorrentes</h2>
          <p className="text-sm text-muted-foreground">Seus gastos fixos de todo mês.</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Nova conta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Essenciais / mês</CardDescription>
            <CardTitle className="text-2xl">{formatBRL(totals.essential)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Não essenciais / mês</CardDescription>
            <CardTitle className="text-2xl">{formatBRL(totals.nonEssential)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total / mês</CardDescription>
            <CardTitle className="text-2xl text-primary">{formatBRL(totals.total)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {bills.length === 0 ? (
        <Card className="items-center gap-2 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma conta recorrente. Cadastre suas contas fixas.
          </p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            Criar a primeira
          </Button>
        </Card>
      ) : (
        groups.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.label} className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h3>
                <Card className="gap-0 py-0">
                  {group.items
                    .slice()
                    .sort((a, b) => a.dueDay - b.dueDay)
                    .map((bill) => (
                      <div
                        key={bill.id}
                        className={cn(
                          "group flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0",
                          !bill.active && "opacity-50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={bill.active}
                          disabled={busyId === bill.id}
                          onChange={() => handleToggle(bill)}
                          aria-label="Ativa"
                          className="size-4 shrink-0 accent-primary"
                        />
                        <span className="flex-1 truncate text-sm font-medium">{bill.name}</span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="size-3" />
                          dia {bill.dueDay}
                        </span>
                        <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
                          {formatBRL(bill.amount)}
                        </span>
                        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Editar"
                            onClick={() => openEdit(bill)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Excluir"
                            onClick={() => setDeleting(bill)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </div>
                    ))}
                </Card>
              </section>
            ),
        )
      )}

      <RecurringBillDialog />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir “{deleting?.name}”?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={busyId === deleting?.id}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
