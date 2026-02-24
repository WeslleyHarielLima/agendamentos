# Configuração Básica do Projeto

Documentação das ferramentas de qualidade de código configuradas neste projeto Next.js.

---

## Visão Geral

O projeto utiliza três camadas de garantia de qualidade:

| Ferramenta     | Responsabilidade                 |
| -------------- | -------------------------------- |
| **Prettier**   | Formatação de código             |
| **ESLint**     | Análise estática e boas práticas |
| **TypeScript** | Checagem de tipos                |
| **Lefthook**   | Automação via Git hooks          |

---

## Prettier

**O que é:** Formatador de código opinado que garante estilo consistente em todo o projeto, independente de quem escreve o código.

**Arquivo:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true
}
```

**Regras configuradas:**

- `semi: true` — ponto e vírgula obrigatório
- `singleQuote: true` — aspas simples em strings
- `tabWidth: 2` — indentação com 2 espaços
- `trailingComma: "es5"` — vírgula final em objetos e arrays multi-linha
- `printWidth: 80` — quebra de linha a partir de 80 caracteres
- `bracketSpacing: true` — espaço dentro de chaves `{ foo: bar }`

**Como rodar manualmente:**

```bash
pnpm format         # verifica arquivos com problemas de formatação
```

---

## ESLint

**O que é:** Ferramenta de análise estática que identifica padrões problemáticos no código JavaScript/TypeScript, como erros comuns, más práticas e violações de estilo.

**Arquivo:** `eslint.config.mjs`

**Configurações estendidas:**

- `next/core-web-vitals` — regras do Next.js voltadas para performance e boas práticas
- `next/typescript` — regras específicas para TypeScript no Next.js
- `prettier` — desativa regras do ESLint que conflitam com o Prettier (evita conflito entre os dois)

**Arquivos ignorados:**

- `src/generated/prisma/**` — código gerado automaticamente
- `pgdata/**` — dados do banco de dados local
- `.next/**` — build do Next.js
- `node_modules/**` — dependências

**Como rodar manualmente:**

```bash
pnpm lint
```

---

## TypeScript

**O que é:** Superset do JavaScript que adiciona tipagem estática, detectando erros de tipo em tempo de desenvolvimento antes de chegar em produção.

**Arquivo:** `tsconfig.json`

**Configurações relevantes:**

- `strict: true` — habilita todas as verificações estritas de tipo
- `noEmit: true` — apenas checa os tipos, não gera arquivos de saída
- `skipLibCheck: true` — pula checagem de tipos em `.d.ts` de dependências
- `paths: { "@/*": ["./src/*"] }` — alias `@/` aponta para `src/`

**Como rodar manualmente:**

```bash
pnpm validate:typecheck
```

---

## Lefthook

**O que é:** Gerenciador de Git hooks rápido e leve. Executa scripts automaticamente em momentos específicos do fluxo Git (antes de commits, pushes, etc.), garantindo que código com problemas não seja enviado ao repositório.

**Arquivo:** `lefthook.yml`

```yaml
pre-commit:
  commands:
    check:
      run: pnpm format {staged_files}
      glob: '*.{js,jsx,mjs,ts,tsx,css,json,md}'
      stage_fixed: true

pre-push:
  commands:
    validate:
      glob: '*.{ts,tsx}'
      run: pnpm validate:typecheck
```

### Hook: `pre-commit`

Executado **antes de cada commit**. Roda o Prettier apenas nos arquivos staged que correspondam ao glob, e re-adiciona automaticamente os arquivos corrigidos (`stage_fixed: true`).

**Fluxo:**

```
git commit → Prettier formata staged files → arquivos corrigidos são re-staged → commit continua
```

### Hook: `pre-push`

Executado **antes de cada push**. Roda o TypeScript typecheck nos arquivos `.ts` e `.tsx` modificados. Se houver erro de tipo, o push é bloqueado.

**Fluxo:**

```
git push → tsc --noEmit verifica tipos → ✅ sem erros: push acontece | ❌ com erros: push bloqueado
```

**Instalação dos hooks** (necessário rodar uma vez após clonar o repositório):

```bash
npx lefthook install
```

---

## Scripts disponíveis

```bash
pnpm dev                  # inicia servidor de desenvolvimento
pnpm build                # gera build de produção
pnpm lint                 # análise estática com ESLint
pnpm format               # verifica formatação com Prettier
pnpm validate:typecheck   # checagem de tipos com TypeScript
```
