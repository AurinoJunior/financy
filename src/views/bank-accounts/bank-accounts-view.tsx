"use client"

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { deleteBankAccount } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BankAccount } from "@/db/app-schema"
import { useBankAccountModal } from "@/stores/bank-account-modal"
import { formatBRL } from "@/utils/format"
import { BANK_ACCOUNT_TYPE_LABELS, type BankAccountType } from "@/validations/bank-account"
import { BankIcon } from "@/views/transactions/bank-icon"
import { BankAccountModal } from "./bank-account-modal"

export function BankAccountsView({ accounts }: { accounts: BankAccount[] }) {
  const openCreate = useBankAccountModal((s) => s.openCreate)
  const openEdit = useBankAccountModal((s) => s.openEdit)
  const [deleting, setDeleting] = useState<BankAccount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const checkingAccounts = accounts.filter((a) => a.type === "checking")
  const creditAccounts = accounts.filter((a) => a.type === "credit")

  async function confirmDelete() {
    if (!deleting) return
    setIsDeleting(true)
    const result = await deleteBankAccount(deleting.id)
    setIsDeleting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success("Conta excluída")
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>
          <PlusIcon />
          Nova conta
        </Button>
      </div>

      {accounts.length === 0 && (
        <Card className="items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma conta cadastrada. Adicione suas contas para ver saldos no dashboard.
          </p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            Adicionar conta
          </Button>
        </Card>
      )}

      {checkingAccounts.length > 0 && (
        <AccountGroup
          label="Contas correntes"
          accounts={checkingAccounts}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      )}

      {creditAccounts.length > 0 && (
        <AccountGroup
          label="Cartões de crédito"
          accounts={creditAccounts}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      )}

      <BankAccountModal />

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-foreground">{deleting?.name}</span>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AccountGroup({
  label,
  accounts,
  onEdit,
  onDelete,
}: {
  label: string
  accounts: BankAccount[]
  onEdit: (a: BankAccount) => void
  onDelete: (a: BankAccount) => void
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id} className="group flex-row items-center gap-3 px-4 py-3">
            <BankIcon bank={account.bank} size={36} />
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{account.name}</p>
              <p className="text-xs text-muted-foreground">
                {BANK_ACCOUNT_TYPE_LABELS[account.type as BankAccountType]}
                {" · "}
                {account.type === "credit"
                  ? `Limite ${formatBRL(account.balance)}`
                  : formatBRL(account.balance)}
              </p>
            </div>
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Editar"
                onClick={() => onEdit(account)}
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Excluir"
                onClick={() => onDelete(account)}
              >
                <Trash2Icon />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
