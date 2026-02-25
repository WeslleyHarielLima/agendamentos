# Roteiro de Desenvolvimento — Sistema de Agendamentos Clínicos

## Estado Atual (já feito)

- [x] Design system completo (`globals.css`) — paleta dark, tipografia, tokens de cor
- [x] Schema Prisma — model `Compromisso` (id, pacienteNome, procedimento, telefone, descricao, dataMarcacao)
- [x] Layout raiz com Inter + Inter Tight (`layout.tsx`)
- [x] Componente `Button` com variantes (CVA + Radix Slot)
- [x] Componente `PeriodSection` — estrutura com ícones Manhã/Tarde/Noite
- [x] Página principal (`page.tsx`) — cabeçalho "Sua Agenda" + dados mock

---

## ~~Fase 1 — Formulário de Agendamento (Criação)~~ ✅ CONCLUÍDA

### Passo 1 — Configurar banco de dados

- [x] `DATABASE_URL` já configurada no `.env`
- [x] `npx prisma generate` — client gerado em `src/generated/prisma`
- [x] `npx prisma db push` — schema sincronizado com PostgreSQL

### Passo 2 — Schema de validação do formulário

- [x] `zod` v4 instalado via pnpm
- [x] `src/lib/schemas/compromisso-schema.ts` criado
  - `compromissoFormSchema` — validação dos campos do form (com `data` e `hora` separados)
  - `compromissoSchema` — validação da Server Action (com `dataMarcacao: Date`)

### Passo 3 — Primeiros inputs do formulário

- [x] Componente `AppointmentForm` criado em `src/components/ui/appointment-form/`
- [x] Componente `Input` criado em `src/components/ui/input/`
- [x] Componente `Label` criado em `src/components/ui/label/`
- [x] Componente `Textarea` criado em `src/components/ui/textarea/`

### Passo 4 — Input de Telefone

- [x] Máscara manual `(XX) XXXXX-XXXX` via `formatTelefone()` no `onChange`
- [x] Sem lib extra — implementação nativa com `setValue` do react-hook-form

### Passo 5 — Input de Calendário / Select de Data (Parte 1 e 2)

- [x] Input nativo `type="date"` e `type="time"` estilizados com o design system
- [x] Ícone do picker adaptado para dark mode via CSS (`filter: invert`)
- [x] `data` + `hora` combinados em `dataMarcacao: Date` no submit

### Passo 6 — Finalizar visual do formulário

- [x] Tokens do design system aplicados em todos os campos
- [x] Estado `isSubmitting` desabilita botão e exibe "Salvando..."
- [x] Mensagens de erro inline por campo via Zod + react-hook-form
- [x] Dialog com overlay blur, botão de fechar e reset ao cancelar

### Passo 7 — Função de Submit + Server Action (Criação)

- [x] `react-hook-form` v7 + `@hookform/resolvers` v5 instalados
- [x] `src/actions/criar-compromisso.ts` criado com `'use server'`
  - Validação dupla com Zod
  - Persistência via Prisma
  - Retorno `{ success, error }`
- [x] Form conectado via `handleSubmit` → Server Action
- [x] `revalidatePath('/')` chamado após criação
- [x] Toast de sucesso/erro via Sonner (Toaster no layout raiz)
- [x] `src/lib/prisma.ts` — singleton do PrismaClient

---

## Fase 2 — Listagem de Agendamentos

### Passo 8 — Buscar compromissos do banco

- [ ] Criar `src/actions/listar-compromissos.ts` (ou query direta no Server Component)
- [ ] Buscar todos os compromissos ordenados por `dataMarcacao`

### Passo 9 — Agrupar por período do dia

- [ ] Implementar `grupoCompromissosporPeriodo()` em `page.tsx` (função incompleta no momento)
  - Manhã: 06:00 – 11:59
  - Tarde: 12:00 – 17:59
  - Noite: 18:00 – 23:59
- [ ] Tipar corretamente (remover `any`)

### Passo 10 — Renderizar PeriodSection com dados reais

- [ ] Tipar `PeriodSectionProps` corretamente
- [ ] Criar componente `AppointmentCard` em `src/components/ui/appointment-card/`
  - Exibir: nome do paciente, procedimento, horário, telefone
- [ ] Renderizar lista de cards dentro de cada `PeriodSection`

---

## Fase 3 — Edição e Exclusão

### Passo 11 — Editar Agendamento

- [ ] Criar página/modal de edição: `src/app/agendamento/[id]/editar/`
- [ ] Pré-popular formulário com dados existentes (busca por ID)
- [ ] Criar `src/actions/atualizar-compromisso.ts`
  - Validar com Zod
  - Atualizar no banco
  - `revalidatePath('/')`

### Passo 12 — Excluir Agendamento

- [ ] Adicionar botão de exclusão no `AppointmentCard` ou na página de edição
- [ ] Criar `src/actions/deletar-compromisso.ts`
  - Confirmar exclusão (dialog de confirmação)
  - Deletar no banco
  - `revalidatePath('/')`

---

## Fase 4 — Busca e Navegação

### Passo 13 — Busca dinâmica

- [ ] Adicionar input de busca na página principal
- [ ] Filtrar compromissos por nome do paciente ou procedimento
- [ ] Usar `searchParams` do Next.js para busca server-side (sem estado no cliente)
- [ ] Debounce no input de busca

### Passo 14 — DatePicker aprimorado + Calendar de navegação

- [ ] Melhorar o `DatePicker` com seleção visual de mês/ano
- [ ] Adicionar componente `Calendar` para navegar entre datas na listagem
- [ ] Criar `NavigationButton` (anterior/próximo dia ou semana)

### Passo 15 — Refatorar Server Actions

- [ ] Centralizar lógica de validação e tratamento de erros
- [ ] Padronizar retorno das actions: `{ success: boolean; error?: string; data?: T }`

---

## Fase 5 — Ajustes Finais e Deploy

### Passo 16 — Ajustes finais de UI/UX

- [ ] Revisar responsividade (mobile-first)
- [ ] Estados vazios (sem agendamentos no período)
- [ ] Loading states (Suspense / skeleton)
- [ ] Acessibilidade básica (labels, aria)

### Passo 17 — Deploy

- [ ] Provisionar banco PostgreSQL (Neon, Supabase ou Railway)
- [ ] Configurar variáveis de ambiente na plataforma de deploy
- [ ] Deploy na Vercel (ou plataforma escolhida)
- [ ] Rodar `prisma migrate deploy` em produção
- [ ] Testar fluxo completo em produção

---

## Ordem de Prioridade

```
Fase 1 (Formulário) → Fase 2 (Listagem) → Fase 3 (Edição/Exclusão) → Fase 4 (Busca/Nav) → Fase 5 (Deploy)
```

Cada fase entrega valor funcional independente — ao final da Fase 2 já existe um MVP funcional de criação e visualização.
