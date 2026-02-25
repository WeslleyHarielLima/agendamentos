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

## ~~Fase 2 — Listagem de Agendamentos~~ ✅ CONCLUÍDA

### Passo 8 — Buscar compromissos do banco

- [x] `src/actions/listar-compromissos.ts` — `findMany` ordenado por `dataMarcacao asc`

### Passo 9 — Agrupar por período do dia

- [x] `src/lib/compromisso-utils.ts` — tipos `Compromisso`, `PeriodoKey`, `GruposPorPeriodo`
- [x] `grupoCompromissosporPeriodo()` — Manhã 06–11h / Tarde 12–17h / Noite 18–05h
- [x] `page.tsx` convertido para `async` — busca real no banco + agrupamento

### Passo 10 — Renderizar PeriodSection com dados reais

- [x] `PeriodSection` reescrito com props tipadas (`type`, `compromissos`)
- [x] Estado vazio com mensagem "Nenhum agendamento neste período."
- [x] Contador de agendamentos no header do período
- [x] `AppointmentCard` criado em `src/components/ui/appointment-card/`
  - Horário, nome do paciente, procedimento e telefone
  - Ícones: Clock, User, Stethoscope, Phone (lucide-react)

---

## ~~Fase 3 — Edição e Exclusão~~ ✅ CONCLUÍDA

### Passo 11 — Editar Agendamento

- [x] Dialog de edição com formulário pré-populado (`src/components/ui/edit-appointment-form/`)
- [x] Busca dados do compromisso existente via props
- [x] `src/actions/atualizar-compromisso.ts`
  - Validação com Zod
  - `update` no banco via Prisma
  - `revalidatePath('/')`

### Passo 12 — Excluir Agendamento

- [x] Botões de editar (lápis) e excluir (lixeira) no `AppointmentCard` — visíveis ao hover
- [x] `src/actions/deletar-compromisso.ts`
  - Dialog de confirmação com nome do paciente
  - `delete` no banco via Prisma
  - `revalidatePath('/')`

---

## Fase 4 — Layout Global + Navegação

### Passo 13 — Sidebar de navegação

- [ ] `src/components/ui/sidebar/sidebar.tsx` — componente client com `usePathname`
  - Logo/título do sistema
  - Links: Agenda (`/`), Pacientes (`/pacientes`), Procedimentos (`/procedimentos`), Relatórios (`/relatorios`)
  - Link ativo destacado com cor brand
  - Ícones: Calendar, Users, Stethoscope, BarChart2 (lucide-react)
- [ ] `src/app/layout.tsx` — layout `flex` com sidebar fixa 240px + `flex-1` para conteúdo

---

## Fase 5 — Cadastro de Procedimentos

### Passo 14 — Schema + Actions de Procedimento

- [ ] `prisma/schema.prisma` — novo model `Procedimento` (id, nome, valor: Decimal, descricao, ativo)
- [ ] `npx prisma db push` + `npx prisma generate`
- [ ] `src/actions/criar-procedimento.ts`
- [ ] `src/actions/atualizar-procedimento.ts`
- [ ] `src/actions/deletar-procedimento.ts` — desativação lógica (`ativo = false`)
- [ ] `src/actions/listar-procedimentos.ts`
- [ ] `src/lib/schemas/procedimento-schema.ts` — Zod schema

### Passo 15 — Página de Procedimentos

- [ ] `src/app/procedimentos/page.tsx` — tabela de procedimentos + botão "Novo Procedimento"
- [ ] `src/components/ui/procedure-form/procedure-form.tsx` — Dialog de criação/edição
  - Campos: nome, valor (R$), descrição opcional
  - Valor formatado em BRL (Intl.NumberFormat)

---

## Fase 6 — Cadastro de Pacientes + Migração do Schema

### Passo 16 — Schema completo com relações

- [ ] `prisma/schema.prisma` — atualização completa:
  - Model `Paciente` (id, nome, telefone, email?, criadoEm)
  - Enum `StatusCompromisso` (AGENDADO, REALIZADO, CANCELADO)
  - `Compromisso` atualizado: `pacienteId` FK + `procedimentoId` FK + `status`
- [ ] Script de migração para preservar dados existentes
- [ ] `npx prisma db push` + `npx prisma generate`

### Passo 17 — CRUD de Pacientes

- [ ] `src/actions/` — criar, atualizar, deletar, listar, buscarPorId para Paciente
- [ ] `src/lib/schemas/paciente-schema.ts` — Zod schema
- [ ] `src/app/pacientes/page.tsx` — lista com busca por nome
- [ ] `src/components/ui/patient-form/patient-form.tsx` — Dialog de criação/edição
- [ ] `src/app/pacientes/[id]/page.tsx` — histórico completo do paciente

### Passo 18 — Atualizar formulário de agendamento

- [ ] `src/components/ui/combobox/combobox.tsx` — novo componente (Radix Popover + busca)
- [ ] `appointment-form.tsx` — campo paciente vira Combobox com autocomplete
  - Opção "Cadastrar novo paciente" inline
  - Telefone preenchido automaticamente ao selecionar
- [ ] `appointment-form.tsx` — campo procedimento vira Combobox
  - Exibe nome + valor (R$) na lista
  - Valor do procedimento exibido ao selecionar

---

## Fase 7 — Calendário Mensal

### Passo 19 — Componente de grade do calendário

- [ ] `src/components/ui/calendar/calendar.tsx` — grid 7×5:
  - Cabeçalho com mês/ano + setas prev/next (links com `searchParams`)
  - Dia atual destacado
  - Dias com agendamentos mostram ponto colorido
  - Dia selecionado destacado com cor brand (`--color-content-brand`)

### Passo 20 — Integração na página principal

- [ ] `src/app/page.tsx` — layout split: calendário fixo à esquerda + agenda filtrada à direita
- [ ] `src/actions/listar-compromissos.ts` — aceitar filtro de data (`where: { dataMarcacao: { gte, lte } }`)
- [ ] Filtro por dia e mês via `searchParams` (server-side):
  - `/?data=2026-02-25` — filtra agendamentos do dia
  - `/?mes=2026-02` — navega o calendário para o mês

---

## Fase 8 — Relatórios

### Passo 21 — Actions de relatório

- [ ] `src/actions/relatorios/faturamento-por-periodo.ts` — soma de `procedimento.valor` agrupada por data
- [ ] `src/actions/relatorios/ranking-procedimentos.ts` — count e sum agrupados por `procedimentoId`
- [ ] `src/actions/relatorios/historico-paciente.ts` — findMany com `where: { pacienteId }`

### Passo 22 — Página de Relatórios

- [ ] `src/app/relatorios/page.tsx` — tabs com 4 seções:
  1. **Faturamento** — cards de total + gráfico de barras em CSS
  2. **Procedimentos** — ranking dos mais realizados com receita gerada
  3. **Histórico por paciente** — select de paciente → lista de atendimentos
  4. **Exportar** — download CSV via Route Handler
- [ ] `src/components/ui/relatorios/stat-card.tsx` — card de métrica
- [ ] `src/components/ui/relatorios/bar-chart.tsx` — gráfico de barras sem lib externa
- [ ] `src/components/ui/relatorios/period-filter.tsx` — seletor de período
- [ ] `src/app/api/exportar/route.ts` — Route Handler que gera e serve CSV

---

## Ordem de Execução

```
Fase 4 (Nav) → Fase 5 (Procedimentos) → Fase 6 (Pacientes + Migração)
    → Fase 7 (Calendário) → Fase 8 (Relatórios)
```

A Fase 6 depende da 5 (o form de agendamento precisa de procedimentos cadastrados para o combobox).
Cada fase entrega valor funcional independente — a Fase 4 já organiza a navegação do sistema.
