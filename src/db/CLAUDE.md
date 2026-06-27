# src/db — Guia para o Claude

Camada de acesso ao banco de dados. Usa **Drizzle ORM** com **PostgreSQL**.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.ts` | Instância do `db` (singleton com reuso de conexão em dev) — passa schemas como `{ appSchema, authSchema }` |
| `auth-schema.ts` | Tabelas geradas pelo Better Auth (`user`, `session`, `account`, `verification`) — não editar manualmente |
| `app-schema.ts` | Barrel — re-exporta todos os schemas da aplicação em ordem alfabética |
| `category-schema.ts` | Tabela `category` |
| `csv-import-schema.ts` | Tabela `csv_import` |
| `transaction-schema.ts` | Tabela `transaction` |
| `recurring-bill-schema.ts` | Tabela `recurring_bill` |
| `financial-plan-schema.ts` | Tabela `financial_plan` |
| `healthcheck.ts` | Script de checagem de conexão (`pnpm db:check`) |

## Como adicionar uma nova tabela

1. Crie `src/db/[nome]-schema.ts` com a tabela e o tipo exportado
2. Adicione `export * from "./[nome]-schema"` em `app-schema.ts`
3. Rode `pnpm db:generate` para gerar a migration
4. Rode `pnpm db:migrate` para aplicar

## Convenções

- **IDs**: `text` com `crypto.randomUUID()` como default — nunca serial/integer
- **Timestamps**: toda tabela tem `created_at` (defaultNow) e `updated_at` ($onUpdate)
- **Foreign keys**: sempre com `onDelete: "cascade"` para registros filhos do usuário
- **Valores monetários**: `integer` em centavos — nunca `decimal` ou `float`
- **Enums**: guardados como `text` com comentário indicando os valores válidos; validação por Zod na camada de aplicação
- **Índices**: criar índice em toda coluna usada em `where` com frequência (especialmente `userId`)

## Importações

Importe tabelas e tipos diretamente do arquivo de schema específico (`@/db/category-schema`, `@/db/transaction-schema`, etc.) ou via barrel `@/db/app-schema`. O arquivo `schema.ts` foi removido — não usar mais esse caminho.
