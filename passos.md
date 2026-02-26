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

## ~~Fase 4 — Layout Global + Navegação~~ ✅ CONCLUÍDA

### Passo 13 — Sidebar de navegação

- [x] `src/components/ui/sidebar/sidebar.tsx` — componente client com `usePathname`
  - Logo/título do sistema
  - Links: Agenda (`/`), Pacientes (`/pacientes`), Procedimentos (`/procedimentos`), Relatórios (`/relatorios`)
  - Link ativo destacado com cor brand
  - Ícones: Calendar, Users, Stethoscope, BarChart2 (lucide-react)
- [x] `src/app/layout.tsx` — layout `flex` com sidebar fixa 240px + `flex-1` para conteúdo

---

## ~~Fase 5 — Cadastro de Procedimentos~~ ✅ CONCLUÍDA

### Passo 14 — Schema + Actions de Procedimento

- [x] `prisma/schema.prisma` — novo model `Procedimento` (id, nome, valor: Decimal, descricao, ativo)
- [x] `npx prisma db push` + `npx prisma generate`
- [x] `src/actions/criar-procedimento.ts`
- [x] `src/actions/atualizar-procedimento.ts`
- [x] `src/actions/deletar-procedimento.ts` — desativação lógica (`ativo = false`)
- [x] `src/actions/listar-procedimentos.ts`
- [x] `src/lib/schemas/procedimento-schema.ts` — Zod schema

### Passo 15 — Página de Procedimentos

- [x] `src/app/procedimentos/page.tsx` — tabela de procedimentos + botão "Novo Procedimento"
- [x] `src/components/ui/procedure-form/procedure-form.tsx` — Dialog de criação/edição
  - Campos: nome, valor (R$), descrição opcional
  - Valor formatado em BRL (Intl.NumberFormat)

---

## ~~Fase 6 — Cadastro de Pacientes + Migração do Schema~~ ✅ CONCLUÍDA

### Passo 16 — Schema completo com relações

- [x] `prisma/schema.prisma` — atualização completa:
  - Model `Paciente` (id, nome, telefone, email?, criadoEm)
  - Enum `StatusCompromisso` (AGENDADO, REALIZADO, CANCELADO)
  - `Compromisso` atualizado:
    - `pacienteId` FK + `procedimentoId` FK (opcionais para backward compat)
    - `status: StatusCompromisso` (default AGENDADO)
    - `valorCobrado: Decimal?` — valor real cobrado no atendimento
    - `observacao: String?` — anotações do atendimento
- [x] `npx prisma db push` + `npx prisma generate`

### Passo 17 — CRUD de Pacientes

- [x] `src/actions/criar-paciente.ts` — retorna dados do paciente criado
- [x] `src/actions/atualizar-paciente.ts`
- [x] `src/actions/deletar-paciente.ts`
- [x] `src/actions/listar-pacientes.ts`
- [x] `src/actions/buscar-paciente.ts` — inclui histórico de compromissos
- [x] `src/lib/schemas/paciente-schema.ts` — Zod schema
- [x] `src/app/pacientes/page.tsx` — lista com busca por nome/telefone/e-mail
- [x] `src/app/pacientes/pacientes-list.tsx` — componente client com filtro
- [x] `src/components/ui/patient-form/patient-form.tsx` — Dialog de criação/edição
  - Suporta callback `onCreated` para uso inline no AppointmentForm
- [x] `src/app/pacientes/[id]/page.tsx` — histórico completo do paciente

### Passo 18 — Atualizar formulário de agendamento

- [x] `src/components/ui/combobox/combobox.tsx` — Radix Popover + busca + footer customizável
- [x] `appointment-form.tsx` — campo paciente vira Combobox com autocomplete
  - Opção "Cadastrar novo paciente" inline (abre PatientForm aninhado)
  - Telefone exibido automaticamente ao selecionar
  - Lista de pacientes atualizada em tempo real após criação inline
- [x] `appointment-form.tsx` — campo procedimento vira Combobox
  - Exibe nome + valor (R$) na lista
  - Valor do procedimento exibido ao selecionar
- [x] `src/app/page.tsx` — passa `pacientes` e `procedimentos` como props ao AppointmentForm
- [x] `src/actions/criar-compromisso.ts` — atualizado: recebe `pacienteId`/`procedimentoId`, busca dados e persiste FKs

### Passo 19 — Controle de status no AppointmentCard

- [x] `AppointmentCard` exibe badge de status (AGENDADO / REALIZADO / CANCELADO) com cores distintas
  - Agendado: cinza/neutro
  - Realizado: verde (`bg-green-500/15 text-green-400`)
  - Cancelado: vermelho (`bg-red-500/15 text-destructive`)
- [x] Botão "Finalizar" (ícone ✓✓) visível no hover quando status = AGENDADO
  - Abre `FinalizarAtendimentoDialog`
- [x] `src/components/ui/finalizar-atendimento-dialog/finalizar-atendimento-dialog.tsx`:
  - Mostra resumo: paciente, procedimento, data
  - Campo **Valor Cobrado** pré-preenchido com `Procedimento.valor`, editável
  - Campo opcional de observação
  - Botão "Confirmar e Gerar Recibo" — salva `status = REALIZADO` e `valorCobrado`
- [x] `src/actions/finalizar-atendimento.ts`:
  - Atualiza `status = REALIZADO`, `valorCobrado` e `observacao` no banco
  - `revalidatePath('/')`

---

## ~~Fase 7 — Recibo PDF~~ ✅ CONCLUÍDA

### Passo 20 — Geração do recibo em PDF

- [x] `@react-pdf/renderer` v4 instalado via npm
- [x] `next.config.ts` — `@react-pdf/renderer` adicionado a `serverExternalPackages`
- [x] `src/app/api/recibo/[id]/route.ts` — Route Handler:
  - Busca compromisso com `include: { paciente, procedimentoRel }`
  - Gera PDF com `@react-pdf/renderer` e retorna como `application/pdf`
- [x] `src/lib/pdf/recibo-template.tsx` — template do recibo (componentes do react-pdf):
  - Cabeçalho: nome da clínica + subtítulo "Recibo de Atendimento"
  - Dados do paciente: nome, telefone, e-mail (se houver)
  - Dados do atendimento: procedimento, data, observação
  - **Valor Cobrado**: destaque verde com `valorCobrado`
  - Rodapé: data de emissão + código do compromisso

### Passo 21 — UI de download e compartilhamento

- [x] `FinalizarAtendimentoDialog` — após confirmação exibe tela de ações:
  - Botão **Baixar Recibo** — `window.open('/api/recibo/[id]', '_blank')`
  - Botão **Enviar pelo WhatsApp** — abre `https://wa.me/55{telefone}?text=...`
    - Mensagem: _"Olá {nome}! Segue o recibo do atendimento de {procedimento} realizado em {data}."_
    - Funciona sem API externa — abre o app/web do WhatsApp direto
  - Botão **Fechar** — fecha o dialog e reseta o estado
- [x] `AppointmentCard` com status REALIZADO exibe botão `FileDown` no hover para baixar recibo

---

## ~~Fase 8 — Calendário Mensal~~ ✅ CONCLUÍDA

### Passo 22 — Componente de grade do calendário

- [x] `src/components/ui/calendar/calendar.tsx` — grid 7×N (linhas dinâmicas):
  - Cabeçalho com mês/ano + setas prev/next (links com `searchParams`)
  - Dia atual destacado com anel brand
  - Dias com agendamentos mostram ponto colorido
  - Dia selecionado destacado com cor brand (`--color-content-brand`)

### Passo 23 — Integração na página principal

- [x] `src/app/page.tsx` — layout split: calendário fixo à esquerda + agenda filtrada à direita
- [x] `src/actions/listar-compromissos.ts` — aceita filtro de data (`where: { dataMarcacao: { gte, lte } }`)
- [x] `src/actions/listar-dias-com-agendamentos.ts` — retorna dias do mês com agendamentos
- [x] Filtro por dia e mês via `searchParams` (server-side):
  - `/?data=2026-02-25` — filtra agendamentos do dia
  - `/?mes=2026-02` — navega o calendário para o mês

---

## Fase 9 — Relatórios

### Passo 24 — Actions de relatório

- [ ] `src/actions/relatorios/faturamento-por-periodo.ts` — soma de `valorCobrado` (ou `procedimento.valor` como fallback) agrupada por data
- [ ] `src/actions/relatorios/ranking-procedimentos.ts` — count e sum agrupados por `procedimentoId`
- [ ] `src/actions/relatorios/historico-paciente.ts` — findMany com `where: { pacienteId }` incluindo `valorCobrado`

### Passo 25 — Página de Relatórios

- [ ] `src/app/relatorios/page.tsx` — tabs com 4 seções:
  1. **Faturamento** — cards de total + gráfico de barras em CSS
  2. **Procedimentos** — ranking dos mais realizados com receita gerada
  3. **Histórico por paciente** — select de paciente → lista de atendimentos
  4. **Exportar** — download CSV via Route Handler
- [ ] `src/components/ui/relatorios/stat-card.tsx` — card de métrica
- [ ] `src/components/ui/relatorios/bar-chart.tsx` — gráfico de barras sem lib externa
- [ ] `src/components/ui/relatorios/period-filter.tsx` — seletor de período
- [ ] `src/app/api/exportar/route.ts` — Route Handler que gera CSV com `valorCobrado` por compromisso realizado

---

## Ordem de Execução

```
Fase 4 (Nav) → Fase 5 (Procedimentos) → Fase 6 (Pacientes + Migração + Status)
    → Fase 7 (Recibo PDF) → Fase 8 (Calendário) → Fase 9 (Relatórios)
```

- Fase 6 depende da 5 (combobox de procedimentos no form de agendamento)
- Fase 7 depende da 6 (`valorCobrado`, `status`, dados do paciente para o PDF)
- Fase 9 usa `valorCobrado` da Fase 6 — relatórios de faturamento refletem o valor real cobrado
- Cada fase entrega valor funcional independente
