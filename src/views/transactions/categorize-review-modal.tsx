"use client"

import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  type AiSuggestion,
  applyCategorizations,
  deleteTransactions,
} from "@/app/(app)/transacoes/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ACCOUNT_TYPE_LABELS } from "@/constants/banks"
import type { Category } from "@/db/app-schema"
import { cn } from "@/utils/cn"
import { formatBRL } from "@/utils/format"
import { BankIcon } from "./bank-icon"
import { CategoryPicker } from "./category-picker"

interface CategorizeReviewModalProps {
  open: boolean
  suggestions: AiSuggestion[]
  categories: Category[]
  onClose: () => void
}

export function CategorizeReviewModal({
  open,
  suggestions,
  categories,
  onClose,
}: CategorizeReviewModalProps) {
  const [items, setItems] = useState<AiSuggestion[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Sincroniza o estado local quando o modal abre com novas sugestões
  if (open && items.length === 0 && suggestions.length > 0) {
    setItems(suggestions)
  }

  function handleClose() {
    setItems([])
    setRemovedIds([])
    onClose()
  }

  function handleCategoryChange(id: string, categoryId: string | null) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, categoryId } : item)))
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setRemovedIds((prev) => [...prev, id])
  }

  async function handleSave() {
    setSaving(true)

    const categorizeResult = await applyCategorizations(
      items.map(({ id, categoryId }) => ({ id, categoryId })),
    )

    if (!categorizeResult.ok) {
      setSaving(false)
      toast.error(categorizeResult.error)
      return
    }

    if (removedIds.length > 0) {
      const deleteResult = await deleteTransactions(removedIds)
      if (!deleteResult.ok) {
        setSaving(false)
        toast.error(deleteResult.error)
        return
      }
    }

    setSaving(false)

    const parts: string[] = []
    if (categorizeResult.count > 0) parts.push(`${categorizeResult.count} categorizadas`)
    if (removedIds.length > 0) parts.push(`${removedIds.length} excluídas`)
    toast.success(parts.length > 0 ? parts.join(" · ") : "Nenhuma alteração aplicada")

    handleClose()
  }

  const categorizedCount = items.filter((i) => i.categoryId !== null).length
  const uncategorizedCount = items.length - categorizedCount
  const accountType = items[0]?.accountType as "credit" | "debit" | null | undefined
  const accountTypeLabel = accountType ? ACCOUNT_TYPE_LABELS[accountType] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[80vh] min-w-fit flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            Revisar categorizações{accountTypeLabel ? ` · ${accountTypeLabel}` : ""}
          </DialogTitle>
          <DialogDescription>
            {categorizedCount > 0 && (
              <span className="text-base">
                <span className="font-medium text-foreground">{categorizedCount}</span>{" "}
                categorizadas pela IA
              </span>
            )}
            {categorizedCount > 0 && uncategorizedCount > 0 && (
              <span className="mx-2 text-muted-foreground/40 text-base">·</span>
            )}
            {uncategorizedCount > 0 && (
              <span className="text-base">
                <span className="font-medium text-foreground">{uncategorizedCount}</span> sem
                categoria
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto border-y border-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="flex flex-2 min-w-0 items-center gap-3">
                <BankIcon bank={item.bank} size={32} />
                <p className="truncate text-sm">{item.description}</p>
              </div>

              <span
                className={cn(
                  "w-24 shrink-0 text-right text-sm font-semibold tabular-nums",
                  item.type === "expense" ? "text-red-400" : "text-white",
                )}
              >
                {item.type === "expense" ? "-" : "+"}
                {formatBRL(item.amount)}
              </span>

              <div className="w-40 shrink-0">
                <CategoryPicker
                  categoryId={item.categoryId}
                  categories={categories}
                  onChange={(catId) => handleCategoryChange(item.id, catId)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover"
                onClick={() => handleRemove(item.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (categorizedCount === 0 && removedIds.length === 0)}
          >
            {saving
              ? "Salvando..."
              : `Salvar ${categorizedCount > 0 ? categorizedCount : ""} categorizações`.trim()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
