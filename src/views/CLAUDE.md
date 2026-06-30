# src/views — Guia para o Claude

Contém os arquivos de construção de páginas e seus sub-componentes de feature. Cada subpasta corresponde a uma rota da aplicação.

## Estrutura

```
views/
  dashboard/
    dashboard-view.tsx          # view principal da rota /
    financial-summary.tsx
    category-expenses-card.tsx
    monthly-expenses-card.tsx
    budget-card.tsx
    top-expenses-card.tsx
    month-selector.tsx
  transactions/
    transactions-view.tsx       # view principal da rota /transacoes
    bank-icon.tsx
    category-picker.tsx
    import-modal.tsx
    categorize-modal.tsx        # modal de progresso da categorização IA
    categorize-review-modal.tsx # modal de revisão pós-categorização IA
  categories/
    categories-view.tsx         # view principal da rota /configuracoes
    category-modal.tsx
    delete-category-modal.tsx
  recurring/
    recurring-bills-view.tsx    # view principal da rota /recorrentes
    recurring-bill-card.tsx
    recurring-bill-modal.tsx
  financial-plan/
    financial-planning-view.tsx # sem rota própria — renderizada dentro de /configuracoes
    plan-sliders-card.tsx
    plan-simulation.tsx
    plan-constants.ts           # GROUPS, GroupKey, DEFAULTS compartilhados entre os sub-componentes
```

## Regras

- **Nomenclatura**: o arquivo raiz de cada feature termina em `-view.tsx` (ex: `dashboard-view.tsx`, `transactions-view.tsx`)
- **Uma view por rota**: cada `page.tsx` importa exatamente uma view, que é um Client Component que recebe os dados já buscados pelo Server Component
- **Sub-componentes de feature ficam aqui**: modais, cards e pickers específicos de uma feature vivem na subpasta da view, não em `src/components/`
- **Sem comentários de seção**: ao invés de `{/* Seção X */}`, extraia um componente com nome descritivo em arquivo próprio
- **Constantes compartilhadas**: quando dois sub-componentes precisam do mesmo dado (ex: lista de grupos), extraia para um arquivo `[feature]-constants.ts` na mesma pasta para evitar dependência circular
- **Sem lógica de busca**: views não fazem fetch — recebem tudo via props do `page.tsx`

## Convenção de nomenclatura: Modal vs Dialog

Neste projeto, componentes de overlay/popup de feature são chamados de **Modal** (não Dialog):

- Arquivos: `[feature]-modal.tsx` (ex: `import-modal.tsx`, `category-modal.tsx`)
- Componentes: `[Feature]Modal` (ex: `ImportModal`, `CategoryModal`)
- Stores: `use[Feature]Modal` (ex: `useCategoryModal`, `useRecurringBillModal`)

O primitivo `src/components/ui/dialog.tsx` mantém o nome original (vem do shadcn/base-ui) e é importado internamente pelos modais — não usar o nome "Dialog" em componentes de feature.

## Diferença de src/components/

| `src/views/` | `src/components/` |
|---|---|
| Específico de uma rota/feature | Reutilizável em qualquer rota |
| Não aparece em mais de uma página | Usado por múltiplos contextos |
| Ex: `TransactionsView`, `RecurringBillCard` | Ex: `Topbar`, `AppSidebar`, primitivos UI |

## Como adicionar uma nova página

1. Crie `src/views/[feature]/[feature]-view.tsx` com o Client Component principal
2. Extraia seções em arquivos próprios na mesma subpasta — sem comentários de seção no JSX
3. Se dois sub-componentes compartilham constantes, crie `[feature]-constants.ts`
4. No `page.tsx` da rota, busque os dados e passe para a view:

```tsx
// src/app/(app)/[rota]/page.tsx
import { FeatureView } from "@/views/[feature]/[feature]-view"

export default async function Page() {
  const data = await getData()
  return <FeatureView data={data} />
}
```
