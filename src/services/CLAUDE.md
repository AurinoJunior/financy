# src/services — Guia para o Claude

Integrações com serviços externos: fazem chamadas HTTP e dependem de variáveis de ambiente secretas.

## Regra principal

**Nunca importar em componentes client (`"use client"`) nem em arquivos que sejam executados no browser.** O código aqui acessa `process.env` com chaves secretas — expô-lo ao client vaza as credenciais.

Use serviços apenas em:
- Server Actions (`actions.ts`)
- Route Handlers (`route.ts`)
- Server Components (`page.tsx`, `layout.tsx`)
- Scripts Node.js (`scripts/`)

## Arquivos

- **`ai-categorize.ts`** — categorização de transações via OpenRouter (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`)

## Como adicionar um novo serviço

1. Crie `src/services/[nome].ts`
2. Valide no topo do arquivo se as env vars necessárias existem e lance um erro descritivo se não
3. Exporte só as funções públicas — mantenha helpers internos sem `export`
