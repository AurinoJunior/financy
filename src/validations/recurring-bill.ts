import { z } from "zod"

export const PAYMENT_TYPES = ["pix", "boleto", "credit", "debit_auto"] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  pix: "Pix",
  boleto: "Boleto",
  credit: "Crédito",
  debit_auto: "Débito automático",
}

export const recurringBillSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  amount: z.number().int().positive("Valor inválido"), // centavos
  dueDay: z.number().int().min(1, "Dia inválido").max(31, "Dia inválido"),
  essential: z.boolean(),
  active: z.boolean(),
  paymentType: z.enum(PAYMENT_TYPES).optional(),
})

export type RecurringBillInput = z.infer<typeof recurringBillSchema>
