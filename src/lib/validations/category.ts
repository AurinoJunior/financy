import { z } from "zod"
import { CATEGORY_TYPES } from "@/lib/categories"

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(40, "Nome muito longo"),
  type: z.enum(CATEGORY_TYPES),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().min(1, "Escolha um ícone"),
})

export type CategoryInput = z.infer<typeof categorySchema>
