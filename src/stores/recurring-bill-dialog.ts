import { create } from "zustand"
import type { RecurringBill } from "@/db/app-schema"

type RecurringBillDialogState = {
  open: boolean
  editing: RecurringBill | null
  openCreate: () => void
  openEdit: (bill: RecurringBill) => void
  setOpen: (open: boolean) => void
  close: () => void
}

export const useRecurringBillDialog = create<RecurringBillDialogState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (bill) => set({ open: true, editing: bill }),
  setOpen: (open) => set((state) => ({ open, editing: open ? state.editing : null })),
  close: () => set({ open: false, editing: null }),
}))
