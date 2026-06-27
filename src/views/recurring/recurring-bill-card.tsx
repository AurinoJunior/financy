import { CalendarIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { RecurringBill } from "@/db/app-schema"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/lib/validations/recurring-bill"

export function RecurringBillCard({
  bill,
  busyId,
  onToggle,
  onEdit,
  onDelete,
}: {
  bill: RecurringBill
  busyId: string | null
  onToggle: (bill: RecurringBill) => void
  onEdit: (bill: RecurringBill) => void
  onDelete: (bill: RecurringBill) => void
}) {
  return (
    <Card
      className={cn("group relative gap-4 p-5 transition-opacity", !bill.active && "opacity-50")}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 truncate text-base font-semibold text-muted-foreground">
          {bill.name}
        </span>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={busyId === bill.id}
            onClick={() => onToggle(bill)}
            aria-label={bill.active ? "Ocultar da soma" : "Incluir na soma"}
          >
            {bill.active ? <EyeIcon /> : <EyeOffIcon />}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => onEdit(bill)}>
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir"
            onClick={() => onDelete(bill)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <p className="text-2xl font-bold tabular-nums text-white">{formatBRL(bill.amount)}</p>

      <div className="flex flex-wrap items-center gap-2">
        {bill.paymentType && (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground">
            {PAYMENT_TYPE_LABELS[bill.paymentType as PaymentType]}
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground">
          <CalendarIcon className="size-3" />
          dia {bill.dueDay}
        </span>
      </div>
    </Card>
  )
}
