# src/components — Guia para o Claude

Componentes genuinamente reutilizáveis — usados em mais de uma rota ou que fazem parte do layout global da aplicação.

## Arquivos

| Arquivo | Uso |
|---|---|
| `app-sidebar.tsx` | Sidebar de navegação — renderizada no layout `(app)` |
| `topbar.tsx` | Barra superior com título da página e menu do usuário — renderizada no layout `(app)` |
| `ui/` | Primitivos shadcn/ui — não editar diretamente |

## Regra principal

Antes de criar um componente aqui, pergunte: **ele é usado em mais de uma feature/rota?**

- **Sim** → `src/components/`
- **Não** → `src/views/[feature]/` junto da view que o usa

Componentes de feature (dialogs, pickers, ícones específicos) que só aparecem em uma página pertencem a `src/views/`, mesmo que sejam bem isolados e reutilizáveis em teoria.
