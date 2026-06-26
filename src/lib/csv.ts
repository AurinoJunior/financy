import type { ParsedRow } from "@/lib/validations/transaction"

export type ColumnMapping = {
  date: string
  description: string
  amount: string
}

export type BankFormat = "nubank-debit" | "nubank-credit" | "generic"

type BankParser = {
  format: Exclude<BankFormat, "generic">
  detect: (headers: string[]) => boolean
  mapping: ColumnMapping
  flipSign: boolean
}

const BANK_PARSERS: BankParser[] = [
  {
    format: "nubank-debit",
    // Nubank débito tem coluna "Identificador" com UUID por linha
    detect: (h) => h.some((x) => /^identificador$/i.test(x)),
    mapping: { date: "Data", description: "Descrição", amount: "Valor" },
    flipSign: false,
  },
  {
    format: "nubank-credit",
    // Nubank crédito tem colunas "date", "title", "amount" (em inglês)
    detect: (h) => h.some((x) => /^title$/i.test(x)) && h.some((x) => /^amount$/i.test(x)),
    mapping: { date: "date", description: "title", amount: "amount" },
    // Crédito: positivo = gasto, negativo = pagamento/estorno (sinal inverso ao débito)
    flipSign: true,
  },
]

export function detectBankFormat(headers: string[]): BankFormat {
  for (const parser of BANK_PARSERS) {
    if (parser.detect(headers)) return parser.format
  }
  return "generic"
}

export function getAutoMapping(bankFormat: BankFormat, headers: string[]): Partial<ColumnMapping> {
  const parser = BANK_PARSERS.find((p) => p.format === bankFormat)
  if (parser) return parser.mapping
  return detectColumns(headers)
}

export function isFlipSign(bankFormat: BankFormat): boolean {
  return BANK_PARSERS.find((p) => p.format === bankFormat)?.flipSign ?? false
}

/** Converte "R$ 1.234,56", "-1.234,56", "(1.234,56)" → centavos com sinal. */
export function parseBrAmount(raw: string): number | null {
  if (!raw) return null
  let s = raw.trim().replace(/\s/g, "").replace(/r\$/i, "")
  if (!s) return null

  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }
  if (s.startsWith("-")) {
    negative = true
    s = s.slice(1)
  } else if (s.startsWith("+")) {
    s = s.slice(1)
  }

  // Formato BR: ponto é separador de milhar, vírgula é decimal.
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".")
  }

  const value = Number.parseFloat(s)
  if (Number.isNaN(value)) return null

  const cents = Math.round(Math.abs(value) * 100)
  return negative ? -cents : cents
}

/** Converte "dd/mm/aaaa", "dd-mm-aa" ou ISO → "aaaa-mm-dd". */
export function parseBrDate(raw: string): string | null {
  if (!raw) return null
  const s = raw.trim()

  const br = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (br) {
    const [, d, mo, yRaw] = br
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  return null
}

/** Tenta adivinhar quais colunas são data, descrição e valor. */
export function detectColumns(headers: string[]): Partial<ColumnMapping> {
  const find = (re: RegExp) => headers.find((h) => re.test(h))
  return {
    date: find(/\bdata\b|date|dia\b/i),
    description: find(/descri|hist[oó]|lan[çc]amento|estabelec|memo|t[íi]tulo|description/i),
    amount: find(/valor|amount|montante|quantia|value|pre[çc]o/i),
  }
}

/** Normaliza uma linha do CSV usando o mapeamento de colunas. */
export function normalizeRow(
  row: Record<string, string>,
  mapping: ColumnMapping,
  flipSign = false,
): ParsedRow | null {
  let signed = parseBrAmount(row[mapping.amount] ?? "")
  const date = parseBrDate(row[mapping.date] ?? "")
  const description = (row[mapping.description] ?? "").trim()

  if (signed === null || signed === 0 || date === null || !description) return null

  if (flipSign) signed = -signed

  return {
    date,
    description: description.slice(0, 200),
    amount: Math.abs(signed),
    type: signed < 0 ? "expense" : "income",
  }
}
