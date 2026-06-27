"use client"

import { PlusIcon } from "lucide-react"
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
import { useRecurringBillDialog } from "@/stores/recurring-bill-dialog"
import { RecurringBillCard } from "./recurring-bill-card"
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
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-4">
        <Button onClick={openCreate}>
          <PlusIcon />
          Nova conta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="items-center text-center p-8">
            <CardTitle className="text-[32px] font-black text-primary">
              {formatBRL(totals.total)}
            </CardTitle>
            <CardDescription>Total</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="items-center text-center p-8">
            <CardTitle className="text-[32px] font-black">{formatBRL(totals.essential)}</CardTitle>
            <CardDescription>Essenciais</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="items-center text-center p-8">
            <CardTitle className="text-[32px] font-black">
              {formatBRL(totals.nonEssential)}
            </CardTitle>
            <CardDescription>Não essenciais</CardDescription>
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
                <h3 className="text-base font-medium text-white">{group.label}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items
                    .slice()
                    .sort((a, b) => a.dueDay - b.dueDay)
                    .map((bill) => (
                      <RecurringBillCard
                        key={bill.id}
                        bill={bill}
                        busyId={busyId}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                      />
                    ))}
                </div>
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
              Tem certeza que deseja excluir "{deleting?.name}"?
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
