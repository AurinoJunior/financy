"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createCategory, updateCategory } from "@/app/(app)/configuracoes/actions"
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
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_KEYS,
  CATEGORY_TYPE_LABELS,
  CATEGORY_TYPES,
  getCategoryIcon,
} from "@/constants/categories"
import { useCategoryDialog } from "@/stores/category-dialog"
import { cn } from "@/utils/cn"
import { type CategoryInput, categorySchema } from "@/validations/category"

const emptyValues: CategoryInput = {
  name: "",
  type: "non_essential",
  color: CATEGORY_COLORS[0],
  icon: "other",
}

export function CategoryDialog() {
  const { open, editing, setOpen, close } = useCategoryDialog()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: standardSchemaResolver(categorySchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      editing
        ? {
            name: editing.name,
            type: editing.type as CategoryInput["type"],
            color: editing.color,
            icon: editing.icon,
          }
        : emptyValues,
    )
  }, [open, editing, reset])

  const type = watch("type")
  const color = watch("color")
  const icon = watch("icon")

  async function onSubmit(values: CategoryInput) {
    const result = editing ? await updateCategory(editing.id, values) : await createCategory(values)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(editing ? "Categoria atualizada" : "Categoria criada")
    close()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>Categorias ajudam a IA a classificar seus gastos.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Mercado" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t, { shouldValidate: true })}
                  className={cn(
                    "rounded-lg border border-border px-3 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap min-w-fit",
                    type === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {CATEGORY_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Cor ${c}`}
                  onClick={() => setValue("color", c, { shouldValidate: true })}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110 cursor-pointer",
                    color === c && "ring-2 ring-ring",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ícone</Label>
            <div className="grid max-h-40 grid-cols-8 gap-2 overflow-y-auto rounded-lg border border-border p-2">
              {CATEGORY_ICON_KEYS.map((key) => {
                const Icon = getCategoryIcon(key)
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Ícone ${key}`}
                    onClick={() => setValue("icon", key, { shouldValidate: true })}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted cursor-pointer",
                      icon === key && "bg-primary/15 text-foreground ring-1 ring-primary",
                    )}
                  >
                    <Icon className="size-6" />
                  </button>
                )
              })}
            </div>
          </div>

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
