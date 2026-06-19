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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseBrAmount } from "@/lib/csv"
import { cn } from "@/lib/utils"
import { useRecurringBillDialog } from "@/stores/recurring-bill-dialog"

const formSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  amount: z.string().refine((v) => {
    const cents = parseBrAmount(v)
    return cents !== null && cents > 0
  }, "Valor inválido"),
  dueDay: z.number().int().min(1).max(31),
  essential: z.boolean(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  name: "",
  amount: "",
  dueDay: 5,
  essential: true,
  active: true,
}

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring dark:bg-input/30"

export function RecurringBillDialog() {
  const { open, editing, setOpen, close } = useRecurringBillDialog()
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
          }
        : emptyValues,
    )
  }, [open, editing, reset])

  const dueDay = watch("dueDay")
  const essential = watch("essential")
  const active = watch("active")

  async function onSubmit(values: FormValues) {
    const cents = parseBrAmount(values.amount)
    if (cents === null) return

    const payload = {
      name: values.name,
      amount: Math.abs(cents),
      dueDay: values.dueDay,
      essential: values.essential,
      active: values.active,
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
              <Input id="amount" inputMode="decimal" placeholder="0,00" {...register("amount")} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDay">Vence dia</Label>
              <select
                id="dueDay"
                value={dueDay}
                onChange={(e) =>
                  setValue("dueDay", Number(e.target.value), { shouldValidate: true })
                }
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
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
                    "rounded-lg border border-border px-3 py-2 text-sm transition-colors",
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
