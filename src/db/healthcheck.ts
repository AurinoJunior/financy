import postgres from "postgres"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL não definida — confira o seu .env")
  }

  const sql = postgres(url)

  try {
    const [row] = await sql`select version()`
    console.log("✅ Conectado ao Postgres:", row.version)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error("❌ Falha ao conectar no Postgres:", err)
  process.exitCode = 1
})
