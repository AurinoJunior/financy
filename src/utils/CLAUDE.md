# src/utils — Guia para o Claude

Funções puras compartilhadas entre múltiplas partes da aplicação.

## Regra principal

**Só entra aqui o que for função pura:** sem side effects, sem chamadas HTTP, sem leitura de variáveis de ambiente, sem estado.

| Vai em `utils/` | Vai em outro lugar |
|---|---|
| Formatar valor em BRL | Chamar a OpenRouter API → `services/` |
| Parsear data BR para ISO | Instância do Better Auth → `auth/` |
| Mesclar classes CSS | Constante de lista de bancos → `constants/` |
| Parsear linha de CSV | Lógica de negócio específica de uma feature → `views/[feature]/` |

## Arquivos

- **`format.ts`** — formatação de moeda (`formatBRL`, `maskCurrencyInput`) e data (`formatDateBr`)
- **`cn.ts`** — merge de classes Tailwind (`cn`)
- **`csv.ts`** — parsing e detecção de formato de extratos CSV (`parseBrAmount`, `parseBrDate`, `normalizeRow`, `detectBankFormat`)
