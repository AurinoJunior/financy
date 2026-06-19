import { z } from "zod"

export const recurringBillSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  amount: z.number().int().positive("Valor inválido"), // centavos
  dueDay: z.number().int().min(1, "Dia inválido").max(31, "Dia inválido"),
  essential: z.boolean(),
  active: z.boolean(),
})

export type RecurringBillInput = z.infer<typeof recurringBillSchema>
