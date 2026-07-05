import { z } from "zod"

export const BANK_ACCOUNT_TYPES = ["checking", "credit"] as const
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number]

export const BANK_ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  checking: "Conta corrente",
  credit: "Cartão de crédito",
}

export const bankAccountSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  type: z.enum(BANK_ACCOUNT_TYPES),
  bank: z.string().optional(),
  balance: z.number().int().min(0, "Valor inválido"), // centavos
  closingDay: z.number().int().min(1).max(31).optional(),
})

export type BankAccountInput = z.infer<typeof bankAccountSchema>
