# src/stores — Guia para o Claude

Stores Zustand para **estado de UI** exclusivamente — sem dados de servidor, sem cache de fetch.

## Quando usar uma store

- Estado compartilhado entre componentes client sem relação pai-filho direta
- Controle de modais/dialogs (aberto, fechado, qual item está sendo editado)
- Filtros e seleções de UI que precisam persistir durante a navegação

Dados do servidor (transações, categorias, etc.) ficam em Server Components e são passados como props. A store nunca busca dados — só controla UI.

## Padrão de dialog (criar/editar)

Todo dialog de CRUD segue este contrato:

```ts
import { create } from "zustand"
import type { Entidade } from "@/db/[entidade]-schema"

type EntidadeDialogState = {
  open: boolean
  editing: Entidade | null   // null = modo criação, objeto = modo edição
  openCreate: () => void
  openEdit: (item: Entidade) => void
  setOpen: (open: boolean) => void
  close: () => void
}

export const useEntidadeDialog = create<EntidadeDialogState>((set) => ({
  open: false,
  editing: null,
  openCreate: () => set({ open: true, editing: null }),
  openEdit: (item) => set({ open: true, editing: item }),
  setOpen: (open) => set((state) => ({ open, editing: open ? state.editing : null })),
  close: () => set({ open: false, editing: null }),
}))
```

`editing === null` indica criação; `editing !== null` indica edição. O dialog lê esse valor para preencher o formulário e escolher o título.

## Padrão de filtros

Stores de filtro exportam junto as constantes de opções e seus labels:

```ts
export const OPCOES = ["a", "b"] as const
export type Opcao = (typeof OPCOES)[number]
export const OPCAO_LABELS: Record<Opcao, string> = { a: "A", b: "B" }
```

Isso mantém opções, labels e estado no mesmo arquivo, evitando dessincronização.

## Convenções

- Um arquivo por store, nomeado pela feature: `[feature]-dialog.ts`, `[feature]-filters.ts`
- Exportar apenas o hook (`use[Nome]`) — o type é interno ao arquivo
- Sem middleware (persist, devtools) — o estado é efêmero por design
