/** Centavos → "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * Máscara de moeda em tempo real.
 * Aceita apenas dígitos — trata os últimos 2 como centavos.
 * "1" → "0,01"  |  "150" → "1,50"  |  "150000" → "1.500,00"
 */
export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  const cents = Number.parseInt(digits, 10)
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** "aaaa-mm-dd" → "dd/mm/aaaa". */
export function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}
