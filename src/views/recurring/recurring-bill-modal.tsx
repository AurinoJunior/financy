"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { createRecurringBill, updateRecurringBill } from "@/app/(app)/recorrentes/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FilterSelect } from "@/components/ui/filter-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRecurringBillModal } from "@/stores/recurring-bill-modal"
import { cn } from "@/utils/cn"
import { parseBrAmount } from "@/utils/csv"
import { maskCurrencyInput } from "@/utils/format"
import { PAYMENT_TYPE_LABELS, PAYMENT_TYPES, type PaymentType } from "@/validations/recurring-bill"

const formSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  amount: z.string().refine((v) => {
    const cents = parseBrAmount(v)
    return cents !== null && cents > 0
  }, "Valor inválido"),
  dueDay: z.number().int().min(1).max(31),
  essential: z.boolean(),
  active: z.boolean(),
  paymentType: z.enum(PAYMENT_TYPES).optional(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  name: "",
  amount: "",
  dueDay: 5,
  essential: true,
  active: true,
  paymentType: undefined,
}

function centsToInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const DUE_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `Dia ${i + 1}`,
}))

const PAYMENT_OPTIONS = [
  { value: "", label: "Selecione..." },
  ...PAYMENT_TYPES.map((t) => ({ value: t, label: PAYMENT_TYPE_LABELS[t] })),
]

export function RecurringBillModal() {
  const { open, editing, setOpen, close } = useRecurringBillModal()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      editing
        ? {
            name: editing.name,
            amount: centsToInput(editing.amount),
            dueDay: editing.dueDay,
            essential: editing.essential,
            active: editing.active,
            paymentType: (editing.paymentType as PaymentType) ?? undefined,
          }
        : emptyValues,
    )
  }, [open, editing, reset])

  const dueDay = watch("dueDay")
  const essential = watch("essential")
  const active = watch("active")
  const paymentType = watch("paymentType")
  const amount = watch("amount")

  async function onSubmit(values: FormValues) {
    const cents = parseBrAmount(values.amount)
    if (cents === null) return

    const payload = {
      name: values.name,
      amount: Math.abs(cents),
      dueDay: values.dueDay,
      essential: values.essential,
      active: values.active,
      paymentType: values.paymentType,
    }

    const result = editing
      ? await updateRecurringBill(editing.id, payload)
      : await createRecurringBill(payload)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(editing ? "Conta atualizada" : "Conta criada")
    close()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar conta" : "Nova conta recorrente"}</DialogTitle>
          <DialogDescription>Contas fixas que se repetem todo mês.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Aluguel" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="0,00"
                value={amount}
                onChange={(e) =>
                  setValue("amount", maskCurrencyInput(e.target.value), { shouldValidate: true })
                }
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Vence dia</Label>
              <FilterSelect
                value={String(dueDay)}
                onChange={(v) => setValue("dueDay", Number(v), { shouldValidate: true })}
                options={DUE_DAY_OPTIONS}
                triggerLabel={`Dia ${dueDay}`}
                contentClassName="max-h-[420px]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Essencial" },
                { value: false, label: "Não essencial" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setValue("essential", opt.value, { shouldValidate: true })}
                  className={cn(
                    "cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors",
                    essential === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Forma de pagamento</Label>
            <FilterSelect
              value={paymentType ?? ""}
              onChange={(v) =>
                setValue("paymentType", (v as PaymentType) || undefined, { shouldValidate: true })
              }
              options={PAYMENT_OPTIONS}
              triggerLabel={paymentType ? PAYMENT_TYPE_LABELS[paymentType] : "Selecione..."}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setValue("active", e.target.checked)}
              className="size-4 accent-primary"
            />
            Conta ativa
          </label>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
