# Financy — Guia para o Claude

Aplicação de finanças pessoais para responder "para onde vai meu dinheiro?". O usuário importa extratos CSV do Nubank (débito e crédito), categoriza as transações (manualmente ou via IA) e acompanha gastos no dashboard.

## Stack

- **Next.js 16** com App Router e Turbopack
- **Tailwind CSS v4** + **shadcn/ui** (componentes em `src/components/ui/`)
- **Drizzle ORM** + **PostgreSQL** (Neon em produção, Docker local via `docker-compose.yml`)
- **Better Auth** para autenticação email/senha
- **Biome** para lint e formatação (não ESLint, não Prettier)
- **pnpm** como package manager
- **tsx** para scripts Node.js

## Estrutura

```
src/
  app/
    (app)/          # Rotas protegidas (requer sessão)
    (auth)/         # Login e registro
    api/auth/       # Handlers do Better Auth + utilitários de sessão
  components/
    ui/             # Primitivos shadcn (não editar diretamente)
    [feature]/      # Componentes por domínio (transactions, categories, etc.)
  db/               # Schema Drizzle e conexão
  lib/              # Utilitários, validações Zod, lógica de negócio
  stores/           # Estado global com Zustand (apenas UI state)
scripts/            # Scripts Node.js (seed, testes manuais)
exemplos/           # CSVs de exemplo para testes e seed
```

## Convenções

**Server Actions** são o padrão para mutações — ficam em `actions.ts` dentro da pasta da rota. Toda action valida a sessão como primeira instrução.

**Componentes Client** usam o sufixo `"use client"` e ficam em `src/components/[feature]/`. Páginas (`page.tsx`) são Server Components que buscam dados e passam para componentes client.

**Valores monetários** são sempre armazenados em centavos (inteiro). Formatação acontece só na camada de apresentação via `src/lib/format.ts`.

**Proteção de rotas** é feita pelo `src/proxy.ts` (equivalente ao middleware do Next.js 16). O layout `(app)/layout.tsx` valida a sessão no banco como segunda linha de defesa e redireciona para `/api/auth/clear-session` em caso de cookie inválido.

## Comandos úteis

```bash
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm lint         # Biome lint
pnpm build        # Build de produção
pnpm db:migrate   # Roda migrations pendentes
pnpm db:seed      # Limpa o banco e popula com dados da Maria (maria@financy.dev / financy123)
pnpm db:studio    # Abre o Drizzle Studio
```

## CI/CD

- **CI** (`ci.yml`): lint → build em todo PR para `main`. Versão do `package.json` deve ser alterada a cada PR (job `check-version` falha se não bumpar).
- **CD** (`cd.yml`): roda migrations → deploy na Vercel a cada push em `main`.
