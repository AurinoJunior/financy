"use client"

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { deleteCategory } from "@/app/(app)/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CATEGORY_TYPE_LABELS, getCategoryIcon } from "@/constants/categories"
import type { Category, FinancialPlan } from "@/db/app-schema"
import { useCategoryModal } from "@/stores/category-modal"
import { FinancialPlanningView } from "@/views/financial-plan/financial-planning-view"
import { CategoryModal } from "./category-modal"
import { DeleteCategoryModal } from "./delete-category-modal"

export function CategoriesView({
  categories,
  plan,
}: {
  categories: Category[]
  plan: FinancialPlan | null
}) {
  const openCreate = useCategoryModal((s) => s.openCreate)
  const openEdit = useCategoryModal((s) => s.openEdit)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const groups = [
    { type: "essential" as const, items: categories.filter((c) => c.type === "essential") },
    {
      type: "non_essential" as const,
      items: categories.filter((c) => c.type === "non_essential"),
    },
    { type: "income" as const, items: categories.filter((c) => c.type === "income") },
  ]

  async function confirmDelete() {
    if (!deleting) return
    setIsDeleting(true)
    const result = await deleteCategory(deleting.id)
    setIsDeleting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success("Categoria excluída")
    setDeleting(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-4">
        <Button onClick={openCreate}>
          <PlusIcon />
          Nova categoria
        </Button>
      </div>

      {categories.length === 0 && (
        <Card className="items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">Você ainda não tem categorias.</p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            Criar a primeira
          </Button>
        </Card>
      )}

      <h2 className="text-2xl font-semibold">Categorias</h2>

      {groups.map(
        ({ type, items }) =>
          items.length > 0 && (
            <section key={type} className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CATEGORY_TYPE_LABELS[type]}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((category) => {
                  const Icon = getCategoryIcon(category.icon)
                  return (
                    <Card key={category.id} className="group flex-row items-center gap-3 px-4 py-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <span className="flex-1 truncate font-medium">{category.name}</span>
                      <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Editar"
                          onClick={() => openEdit(category)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Excluir"
                          onClick={() => setDeleting(category)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          ),
      )}

      <h2 className="text-2xl font-semibold">Planejamento financeiro</h2>
      <FinancialPlanningView plan={plan} />

      <CategoryModal />

      <DeleteCategoryModal
        category={deleting}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
