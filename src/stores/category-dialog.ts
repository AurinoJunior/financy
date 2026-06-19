import { create } from "zustand"
import type { Category } from "@/db/app-schema"

type CategoryDialogState = {
  open: boolean
  editing: Category | null
  openCreate: () => void
  openEdit: (category: Category) => void
  setOpen: (open: boolean) => void
  close: () => void
}

export const useCategoryDialog = create<CategoryDialogState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (category) => set({ open: true, editing: category }),
  setOpen: (open) => set((state) => ({ open, editing: open ? state.editing : null })),
  close: () => set({ open: false, editing: null }),
}))
