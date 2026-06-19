import { z } from "zod"

export const TRANSACTION_TYPES = ["income", "expense"] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const parsedRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  description: z.string().trim().min(1).max(200),
  amount: z.number().int().nonnegative(), // centavos
  type: z.enum(TRANSACTION_TYPES),
})

export type ParsedRow = z.infer<typeof parsedRowSchema>

export const importPayloadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  rows: z.array(parsedRowSchema).min(1, "Nenhuma transação para importar").max(5000),
})

export type ImportPayload = z.infer<typeof importPayloadSchema>
