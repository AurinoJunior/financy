export type AccountType = "credit" | "debit"

export type Bank = {
  id: string
  name: string
  logo: string
  color: string
}

export const BANKS: Bank[] = [
  { id: "nubank", name: "Nubank", logo: "/banks/nubank.png", color: "#820AD1" },
  { id: "itau", name: "Itaú", logo: "/banks/itau.svg", color: "#EC7000" },
  { id: "bradesco", name: "Bradesco", logo: "/banks/bradesco.svg", color: "#CC092F" },
  { id: "inter", name: "Inter", logo: "/banks/inter.svg", color: "#FF7A00" },
  { id: "c6", name: "C6 Bank", logo: "/banks/c6.svg", color: "#212121" },
  { id: "outro", name: "Outro", logo: "", color: "#64748b" },
]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit: "Crédito",
  debit: "Débito",
}

export function getBank(id: string | null | undefined): Bank | undefined {
  return BANKS.find((b) => b.id === id)
}
