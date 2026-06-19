"use client"

import { CheckIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { setTransactionCategory } from "@/app/(app)/transacoes/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Category } from "@/db/app-schema"
import { getCategoryIcon } from "@/lib/categories"
import { cn } from "@/lib/utils"

export function CategoryPicker({
  transactionId,
  categoryId,
  categories,
}: {
  transactionId: string
  categoryId: string | null
  categories: Category[]
}) {
  const [pending, setPending] = useState(false)
  const current = categories.find((c) => c.id === categoryId) ?? null
  const CurrentIcon = current ? getCategoryIcon(current.icon) : null

  async function choose(next: string | null) {
    if (next === categoryId) return
    setPending(true)
    const result = await setTransactionCategory(transactionId, next)
    setPending(false)
    if (!result.ok) toast.error(result.error)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors hover:bg-muted",
          pending && "opacity-50",
        )}
      >
        {current && CurrentIcon ? (
          <>
            <span
              className="flex size-4 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: current.color }}
            >
              <CurrentIcon className="size-2.5" />
            </span>
            <span className="text-muted-foreground">{current.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground/60">Sem categoria</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.icon)
          return (
            <DropdownMenuItem key={c.id} onClick={() => choose(c.id)}>
              <span
                className="flex size-4 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: c.color }}
              >
                <Icon className="size-2.5" />
              </span>
              <span className="flex-1">{c.name}</span>
              {c.id === categoryId && <CheckIcon className="size-3.5" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => choose(null)}>
          <span className="text-muted-foreground">Sem categoria</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
