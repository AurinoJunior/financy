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

/** Date → "agora mesmo", "há Xmin", "há Xh", "há X dias", ou "dd/mm" se > 30 dias. */
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "agora mesmo"
  if (diffMins < 60) return `há ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `há ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "há 1 dia"
  if (diffDays < 30) return `há ${diffDays} dias`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}
