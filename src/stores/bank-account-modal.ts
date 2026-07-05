import { create } from "zustand"
import type { BankAccount } from "@/db/app-schema"

type BankAccountModalState = {
  open: boolean
  editing: BankAccount | null
  openCreate: () => void
  openEdit: (account: BankAccount) => void
  setOpen: (open: boolean) => void
  close: () => void
}

export const useBankAccountModal = create<BankAccountModalState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (account) => set({ open: true, editing: account }),
  setOpen: (open) => set((state) => ({ open, editing: open ? state.editing : null })),
  close: () => set({ open: false, editing: null }),
}))
