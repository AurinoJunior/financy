export type AccountType = "credit" | "debit"

export type Bank = {
  id: string
  name: string
  logo: string
  color: string
}

export const BANKS: Bank[] = [
  { id: "nubank", name: "Nubank", logo: "/banks/nubank.png", color: "#820AD1" },
  // adicionar mais bancos aqui
]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit: "Crédito",
  debit: "Débito",
}

export function getBank(id: string | null | undefined): Bank | undefined {
  return BANKS.find((b) => b.id === id)
}
