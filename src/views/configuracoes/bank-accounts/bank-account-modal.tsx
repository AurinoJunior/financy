"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { createBankAccount, updateBankAccount } from "@/app/(app)/configuracoes/actions"
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
import { BANKS } from "@/constants/banks"
import { useBankAccountModal } from "@/stores/bank-account-modal"
import { cn } from "@/utils/cn"
import { parseBrAmount } from "@/utils/csv"
import { maskCurrencyInput } from "@/utils/format"
import {
  BANK_ACCOUNT_TYPE_LABELS,
  BANK_ACCOUNT_TYPES,
  type BankAccountType,
} from "@/validations/bank-account"

const formSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  type: z.enum(BANK_ACCOUNT_TYPES),
  bank: z.string().optional(),
  balance: z.string().refine((v) => {
    const cents = parseBrAmount(v)
    return cents !== null && cents >= 0
  }, "Valor inválido"),
  closingDay: z.number().int().min(1).max(31).optional(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  name: "",
  type: "checking",
  bank: "",
  balance: "",
  closingDay: undefined,
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

const BANK_OPTIONS = [
  { value: "", label: "Nenhum" },
  ...BANKS.map((b) => ({ value: b.id, label: b.name })),
]

export function BankAccountModal() {
  const { open, editing, setOpen, close } = useBankAccountModal()
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
            type: editing.type as BankAccountType,
            bank: editing.bank ?? "",
            balance: centsToInput(editing.balance),
            closingDay: editing.closingDay ?? undefined,
          }
        : emptyValues,
    )
  }, [open, editing, reset])

  const type = watch("type")
  const bank = watch("bank")
  const balance = watch("balance")
  const closingDay = watch("closingDay")

  async function onSubmit(values: FormValues) {
    const cents = parseBrAmount(values.balance)
    if (cents === null) return

    const payload = {
      name: values.name,
      type: values.type,
      bank: values.bank || undefined,
      balance: Math.abs(cents),
      closingDay: values.type === "credit" ? values.closingDay : undefined,
    }

    const result = editing
      ? await updateBankAccount(editing.id, payload)
      : await createBankAccount(payload)

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
          <DialogTitle>{editing ? "Editar conta" : "Nova conta bancária"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize os dados da conta."
              : "Cadastre uma conta para acompanhar seu saldo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Conta Corrente Nubank" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {BANK_ACCOUNT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t, { shouldValidate: true })}
                  className={cn(
                    "cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors",
                    type === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {BANK_ACCOUNT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Banco</Label>
              <FilterSelect
                value={bank ?? ""}
                onChange={(v) => setValue("bank", v || undefined, { shouldValidate: true })}
                options={BANK_OPTIONS}
                triggerLabel={BANKS.find((b) => b.id === bank)?.name ?? "Nenhum"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="balance">
                {type === "credit" ? "Limite (R$)" : "Saldo atual (R$)"}
              </Label>
              <Input
                id="balance"
                inputMode="numeric"
                placeholder="0,00"
                value={balance}
                onChange={(e) =>
                  setValue("balance", maskCurrencyInput(e.target.value), { shouldValidate: true })
                }
              />
              {errors.balance && (
                <p className="text-xs text-destructive">{errors.balance.message}</p>
              )}
            </div>
          </div>

          {type === "credit" && (
            <div className="grid gap-2">
              <Label>Fecha no dia</Label>
              <FilterSelect
                value={closingDay ? String(closingDay) : ""}
                onChange={(v) =>
                  setValue("closingDay", v ? Number(v) : undefined, { shouldValidate: true })
                }
                options={[{ value: "", label: "Selecione..." }, ...DUE_DAY_OPTIONS]}
                triggerLabel={closingDay ? `Dia ${closingDay}` : "Selecione..."}
                contentClassName="max-h-[420px]"
              />
            </div>
          )}

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
