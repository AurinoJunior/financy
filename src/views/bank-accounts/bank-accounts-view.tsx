"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { deleteBankAccount } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { BankAccount } from "@/db/app-schema"
import { useBankAccountModal } from "@/stores/bank-account-modal"
import { BankAccountDeleteModal } from "./bank-account-delete-modal"
import { BankAccountModal } from "./bank-account-modal"
import { BankCard } from "./bank-card"

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Contas bancárias</h2>
        <div className="flex items-center justify-end">
          <Button onClick={openCreate}>
            <PlusIcon />
            Nova conta
          </Button>
        </div>
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

      <div className="flex gap-4">
        {checkingAccounts.length > 0 && (
          <BankCard
            label="Contas correntes"
            accounts={checkingAccounts}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}

        {creditAccounts.length > 0 && (
          <BankCard
            label="Cartões de crédito"
            accounts={creditAccounts}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      <BankAccountModal />
      <BankAccountDeleteModal
        deleting={deleting}
        isDeleting={isDeleting}
        onClose={() => setDeleting(null)}
        confirmDelete={confirmDelete}
      />
    </div>
  )
}
