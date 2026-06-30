// Serviço server-side de categorização via OpenRouter.
// NÃO importar em componentes client (usa OPENROUTER_API_KEY).

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const BATCH_SIZE = 50

export type AiTransaction = {
  id: string
  description: string
  bank?: string | null
  accountType?: string | null
}
export type AiCategory = { id: string; name: string; type: string }

// Transações já categorizadas usadas como exemplos few-shot para o modelo.
// Filtradas por bank+accountType para que os padrões sejam relevantes ao lote.
export type AiExample = {
  description: string
  categoryName: string
  bank?: string | null
  accountType?: string | null
}

type ParsedResult = { results?: Array<{ id?: unknown; categoryId?: unknown }> }

function safeParseJson(content: string): ParsedResult | null {
  try {
    return JSON.parse(content) as ParsedResult
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as ParsedResult
      } catch {
        return null
      }
    }
    return null
  }
}

function buildExamplesSection(batch: AiTransaction[], examples: AiExample[]): string {
  if (examples.length === 0) return ""

  const batchKeys = new Set(batch.map((t) => `${t.bank ?? ""}:${t.accountType ?? ""}`))
  const relevant = examples.filter((e) => batchKeys.has(`${e.bank ?? ""}:${e.accountType ?? ""}`))
  const picked = relevant.length >= 5 ? relevant : examples

  const lines = picked.slice(0, 50).map((e) => `- "${e.description}" → ${e.categoryName}`)
  return `Exemplos de transações já categorizadas pelo usuário (use como referência):\n${lines.join("\n")}\n\n`
}

async function categorizeBatch(
  batch: AiTransaction[],
  categories: AiCategory[],
  apiKey: string,
  model: string,
  examples: AiExample[],
): Promise<Map<string, string>> {
  const typeLabel = (type: string) => {
    if (type === "essential") return "essencial"
    if (type === "income") return "receita/patrimônio"
    return "não essencial"
  }
  const categoryLines = categories
    .map((c) => `- ${c.id}: ${c.name} (${typeLabel(c.type)})`)
    .join("\n")
  const txLines = batch.map((t) => `- ${t.id}: ${t.description}`).join("\n")
  const examplesSection = buildExamplesSection(batch, examples)

  const system =
    "Você categoriza transações de extratos bancários brasileiros. " +
    "Para cada transação, escolha a categoria MAIS adequada da lista fornecida, usando o id da categoria. " +
    "Se nenhuma encaixar bem, deixe sem categoria. " +
    "Responda apenas em JSON, sem texto extra."

  const user =
    `Categorias disponíveis:\n${categoryLines}\n\n` +
    examplesSection +
    `Transações para classificar:\n${txLines}\n\n` +
    `Responda no formato {"results":[{"id":"<id_da_transacao>","categoryId":"<id_da_categoria>"}]}. ` +
    "Sempre use um id de categoria que esteja na lista."

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content ?? "{}"
  const parsed = safeParseJson(content)

  const map = new Map<string, string>()
  for (const item of parsed?.results ?? []) {
    if (typeof item.id === "string" && typeof item.categoryId === "string") {
      map.set(item.id, item.categoryId)
    }
  }
  return map
}

/** Retorna um mapa transactionId → categoryId (apenas ids de categoria válidos). */
export async function categorizeWithAI(
  transactions: AiTransaction[],
  categories: AiCategory[],
  examples: AiExample[] = [],
): Promise<Map<string, string>> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada")
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite"

  const validIds = new Set(categories.map((c) => c.id))
  const result = new Map<string, string>()

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)
    const mapping = await categorizeBatch(batch, categories, apiKey, model, examples)
    for (const [txId, catId] of mapping) {
      if (validIds.has(catId)) result.set(txId, catId)
    }
  }

  return result
}
