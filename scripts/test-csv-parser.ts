import { normalizeRow, parseBrAmount, parseBrDate } from "../src/lib/csv"

let failures = 0
function check(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(
    `${ok ? "✅" : "❌"} ${label} → ${JSON.stringify(got)}${ok ? "" : ` (esperado ${JSON.stringify(expected)})`}`,
  )
}

// parseBrAmount (centavos com sinal)
check("R$ 1.234,56", parseBrAmount("R$ 1.234,56"), 123456)
check("-1.234,56", parseBrAmount("-1.234,56"), -123456)
check("(1.234,56)", parseBrAmount("(1.234,56)"), -123456)
check("89,90", parseBrAmount("89,90"), 8990)
check("-45,00", parseBrAmount("-45,00"), -4500)
check("vazio", parseBrAmount(""), null)

// parseBrDate (ISO)
check("05/01/2026", parseBrDate("05/01/2026"), "2026-01-05")
check("5/1/26", parseBrDate("5/1/26"), "2026-01-05")
check("ISO 2026-01-05", parseBrDate("2026-01-05"), "2026-01-05")
check("data inválida", parseBrDate("xx"), null)

// normalizeRow
const mapping = { date: "Data", description: "Histórico", amount: "Valor" }
check(
  "linha despesa",
  normalizeRow({ Data: "10/06/2026", Histórico: "MERCADO ABC", Valor: "-150,90" }, mapping),
  { date: "2026-06-10", description: "MERCADO ABC", amount: 15090, type: "expense" },
)
check(
  "linha receita",
  normalizeRow({ Data: "01/06/2026", Histórico: "SALARIO", Valor: "5.000,00" }, mapping),
  { date: "2026-06-01", description: "SALARIO", amount: 500000, type: "income" },
)
check(
  "linha valor zero ignorada",
  normalizeRow({ Data: "01/06/2026", Histórico: "SALDO", Valor: "0,00" }, mapping),
  null,
)

console.log(failures === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${failures} TESTE(S) FALHARAM`)
process.exitCode = failures === 0 ? 0 : 1
