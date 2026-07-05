import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { BankAccount } from "@/db/bank-account-schema"
import { formatBRL } from "@/utils/format"
import { BankIcon } from "@/views/transactions/bank-icon"

export function BankCard({
  accounts,
  onEdit,
  onDelete,
}: {
  label: string
  accounts: BankAccount[]
  onEdit: (a: BankAccount) => void
  onDelete: (a: BankAccount) => void
}) {
  const renderCards = accounts.map((account) => (
    <Card key={account.id} className="w-80">
      <CardHeader className="flex flex-col items-center gap-4 group mt-4">
        <BankIcon bank={account.bank} size={36} />
        <h3 className="font-medium text-base">{account.name}</h3>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <p className="text-2xl font-bold">{formatBRL(account.balance)}</p>
      </CardContent>
      <div className="flex items-center justify-center gap-2 p-4">
        <Button className="flex-1" onClick={() => onEdit(account)}>
          Editar
        </Button>
        <Button className="flex-1" onClick={() => onDelete(account)} variant="ghost">
          Deletar
        </Button>
      </div>
    </Card>
  ))

  return renderCards
}
