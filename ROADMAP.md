# Financy — Roadmap

> **Produto:** responder uma única pergunta — _"para onde vai meu dinheiro?"_
> Não é um agregador bancário. O usuário sobe um CSV, a IA categoriza os gastos,
> e o app mostra para onde o dinheiro está indo.

## Stack

- **Next.js** (App Router) + TypeScript — fullstack (server actions + route handlers)
- **Tailwind v4** + **shadcn/ui** — tema dark, acento verde-limão
- **Drizzle ORM** + **Postgres** (Docker local via `docker compose`)
- **Better Auth** — e-mail/senha
- **Zustand** — estado de UI (filtros, modais, seleção)
- **Biome.js** — lint + format
- **OpenRouter** — categorização por IA (apenas server-side)
- **Zod** — validação; **papaparse** — CSV
- **Locale:** pt-BR / BRL, datas dd/mm/aaaa
- **Gerenciador de pacotes:** pnpm (default — ajustável)

## Modelo de dados (rascunho)

- `user`, `session`, `account` — geridos pelo Better Auth
- `category` — id, userId, nome, tipo (`essential` | `non_essential`), cor, ícone, isDefault
- `transaction` — id, userId, data, descrição (raw + limpa), valor, tipo (`income` | `expense`), categoryId (nullable → "Outros"), importId
- `recurring_bill` — id, userId, nome, valor, diaVencimento, essential (bool), categoryId, ativo
- `csv_import` — id, userId, arquivo, status, qtdLinhas, criadoEm

## Princípios

- Chave da OpenRouter **só no servidor**; IA classifica **apenas em categorias existentes** (+ "Outros").
- Validar cada fase antes de seguir. Dashboard vem por último (depende de dados reais).

---

## Fase 0 — Fundação / scaffolding
- Init Next.js + TS + Tailwind v4
- Biome (lint/format) + scripts
- shadcn/ui init + tokens de tema (dark + verde-limão)
- `docker-compose.yml` com Postgres + `.env.example`
- Drizzle: conexão + healthcheck do banco
- Estrutura de pastas
- **✅ Validação:** `pnpm dev` sobe, página placeholder renderiza, DB conecta, `biome check` passa.

## Fase 1 — Auth + Shell do layout
- Better Auth (e-mail/senha) + tabelas via Drizzle
- Páginas `/login` e `/register`; middleware protegendo rotas
- App shell fiel à referência: sidebar compacta (ícones), topbar "Welcome Back"
- **Tema dark/light** com `next-themes` + toggle (default dark)
- **✅ Validação:** registrar, login, logout, rota protegida redireciona, toggle de tema funciona, layout bate com a referência.

## Fase 2 — Categorias (Configurações)
- Schema `category` + migration + seed de categorias padrão pt-BR
- Página `/configuracoes`: CRUD de categorias (nome, cor, ícone, essencial/não-essencial)
- Server actions + Zod + Zustand (modais) + toasts (sonner)
- **✅ Validação:** criar, editar, excluir e listar categorias funcionando.

## Fase 3 — Transações + Import CSV (sem IA)
- Schema `transaction` + `csv_import`
- Upload CSV → parser pt-BR → preview + mapeamento de colunas (data, descrição, valor)
- Persistir transações (categoria nula = "Outros" por enquanto)
- Lista com filtros (período, categoria) — filtros no Zustand
- **✅ Validação:** subir um CSV real e ver as transações listadas corretamente.

## Fase 4 — Categorização por IA (OpenRouter)
- Integração server-side com OpenRouter (key em env)
- Pipeline: transações sem categoria → prompt com categorias existentes → categoryId (ou "Outros")
- Batching, tratamento de erro/custo, fallback
- UI: "Categorizar com IA", revisão e reclassificação manual
- **✅ Validação:** classificar um lote e revisar a acurácia.

## Fase 5 — Contas recorrentes
- Schema `recurring_bill`
- Página `/recorrentes`: CRUD, essencial/não-essencial, dia de vencimento, valor
- **✅ Validação:** cadastrar contas; ver total mensal essencial vs não-essencial.

## Fase 6 — Dashboard (Home)
- Cards de resumo (total gasto, por categoria, essencial vs não-essencial, recorrentes do mês)
- Gráficos (barras por mês, distribuição por categoria) + transações recentes
- Insight central: "para onde vai meu dinheiro"
- **✅ Validação:** dashboard reflete dados reais de CSV + recorrentes.

## Futuro (pós-MVP)
- OAuth Google, comparativo entre meses, orçamentos/metas, exportar relatórios.
