import { and, eq, inArray, isNull } from "drizzle-orm"
import { db } from "../src/db"
import { category, transaction, user } from "../src/db/schema"
import { categorizeWithAI } from "../src/lib/ai-categorize"

async function main() {
  const [maria] = await db.select().from(user).where(eq(user.email, "maria@financy.dev"))
  if (!maria) throw new Error("usuária maria@financy.dev não encontrada")

  const txs = await db
    .select({ id: transaction.id, description: transaction.description })
    .from(transaction)
    .where(and(eq(transaction.userId, maria.id), isNull(transaction.categoryId)))

  const cats = await db
    .select({ id: category.id, name: category.name, type: category.type })
    .from(category)
    .where(eq(category.userId, maria.id))

  console.log(`${txs.length} transações sem categoria · ${cats.length} categorias disponíveis\n`)
  if (txs.length === 0) {
    console.log("Nada para categorizar.")
    return
  }

  const catName = new Map(cats.map((c) => [c.id, c.name]))
  const start = Date.now()
  const mapping = await categorizeWithAI(txs, cats)
  console.log(
    `IA respondeu em ${Date.now() - start}ms · ${mapping.size}/${txs.length} classificadas:\n`,
  )

  for (const t of txs) {
    const catId = mapping.get(t.id)
    console.log(
      `  ${t.description.padEnd(34)} → ${catId ? catName.get(catId) : "— (não classificada)"}`,
    )
  }

  // Persiste (mesma lógica da action), para deixar a demo categorizada.
  const byCategory = new Map<string, string[]>()
  for (const [txId, catId] of mapping) {
    const ids = byCategory.get(catId) ?? []
    ids.push(txId)
    byCategory.set(catId, ids)
  }
  for (const [catId, ids] of byCategory) {
    await db
      .update(transaction)
      .set({ categoryId: catId })
      .where(and(eq(transaction.userId, maria.id), inArray(transaction.id, ids)))
  }
  console.log(`\n✅ ${mapping.size} transações persistidas com categoria.`)
}

main()
  .catch((err) => {
    console.error("❌", err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
