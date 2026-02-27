# Segurança e Maturidade — Agendamentos

Stack: Next.js 16, Prisma 7, PostgreSQL, Zod 4, React Hook Form
Auditoria feita em: 2026-02-26

---

## Estado atual (auditado)

| Item                  | Estado                         |
| --------------------- | ------------------------------ |
| Modelos CRUD          | ✅ completo                    |
| Schemas Zod           | ⚠️ parcial                     |
| Server Actions        | ⚠️ sem auth                    |
| Autenticação          | ❌ ausente                     |
| Autorização (RBAC)    | ❌ ausente                     |
| Rate limiting         | ❌ ausente                     |
| HTTP security headers | ❌ ausente                     |
| Auditoria             | ❌ ausente                     |
| Separação de camadas  | ⚠️ parcial                     |
| PostgreSQL seguro     | ❌ credenciais padrão, sem SSL |

---

## Fase 1 — Autenticação (CRÍTICA — fazer primeiro)

### 1.1 Modelo no schema Prisma

Adicionar em `prisma/schema.prisma`:

```prisma
enum Role {
  ADMIN
  USUARIO
}

model Usuario {
  id           String     @id @default(cuid())
  email        String     @unique
  senhaHash    String
  role         Role       @default(USUARIO)
  ativo        Boolean    @default(true)
  tentativas   Int        @default(0)
  bloqueadoAte DateTime?
  criadoEm    DateTime   @default(now())
  sessions     Session[]

  @@map("usuarios")
}

model Session {
  id        String   @id @default(cuid())
  usuarioId String
  token     String   @unique
  ip        String?
  expiresAt DateTime
  criadoEm DateTime @default(now())
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])

  @@map("sessions")
}
```

Rodar: `pnpm prisma migrate dev --name add-autenticacao`

### 1.2 Dependência de hashing

```bash
pnpm add argon2
```

Criar `src/lib/auth/password.ts`:

```ts
import argon2 from 'argon2';

export async function hashSenha(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verificarSenha(
  plain: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, plain);
}
```

### 1.3 Schema de senha com política mínima

Criar `src/lib/schemas/auth-schema.ts`:

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

export const senhaSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Precisa de ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'Precisa de ao menos um número');
```

### 1.4 Sessão em cookie httpOnly

```bash
pnpm add iron-session
```

Criar `src/lib/auth/session.ts`:

```ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  usuarioId: string;
  role: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!, // min 32 chars
  cookieName: 'agendamentos_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

Adicionar ao `.env`:

```
SESSION_SECRET="gere_uma_string_de_32_caracteres_aqui"
```

### 1.5 Bloqueio por tentativas falhas

Na action de login:

```ts
// 1. Buscar usuário
const usuario = await prisma.usuario.findUnique({ where: { email } });
if (!usuario) return { error: 'Credenciais inválidas' };

// 2. Verificar bloqueio
if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
  return { error: 'Conta bloqueada temporariamente' };
}

// 3. Verificar senha
const valido = await verificarSenha(senha, usuario.senhaHash);
if (!valido) {
  const tentativas = usuario.tentativas + 1;
  const bloqueadoAte =
    tentativas >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tentativas, bloqueadoAte },
  });
  return { error: 'Credenciais inválidas' };
}

// 4. Login bem-sucedido: zerar tentativas
await prisma.usuario.update({
  where: { id: usuario.id },
  data: { tentativas: 0, bloqueadoAte: null },
});
```

### 1.6 Logout real (revogar sessão no banco)

```ts
// src/actions/logout.ts
export async function logout() {
  const session = await getSession();
  if (session.usuarioId) {
    await prisma.session.deleteMany({
      where: { usuarioId: session.usuarioId },
    });
  }
  session.destroy();
  redirect('/login');
}
```

---

## Fase 2 — Autorização RBAC (CRÍTICA)

### 2.1 Função central de autorização

Criar `src/lib/auth/authorize.ts`:

```ts
import { SessionData } from './session';

type Acao = 'create' | 'read' | 'update' | 'delete';
type Recurso =
  | 'compromisso'
  | 'paciente'
  | 'procedimento'
  | 'relatorio'
  | 'usuario';

const permissoes: Record<string, Record<Recurso, Acao[]>> = {
  USUARIO: {
    compromisso: ['create', 'read', 'update'],
    paciente: ['create', 'read', 'update'],
    procedimento: ['read'],
    relatorio: ['read'],
    usuario: [],
  },
  ADMIN: {
    compromisso: ['create', 'read', 'update', 'delete'],
    paciente: ['create', 'read', 'update', 'delete'],
    procedimento: ['create', 'read', 'update', 'delete'],
    relatorio: ['read'],
    usuario: ['create', 'read', 'update', 'delete'],
  },
};

export function authorize(
  session: SessionData,
  acao: Acao,
  recurso: Recurso
): void {
  const acoes = permissoes[session.role]?.[recurso] ?? [];
  if (!acoes.includes(acao)) {
    throw new Error(`Sem permissão para ${acao} em ${recurso}`);
  }
}
```

### 2.2 Helper para pegar sessão autenticada

Criar `src/lib/auth/requireAuth.ts`:

```ts
import { getSession } from './session';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getSession();
  if (!session.usuarioId) {
    redirect('/login');
  }
  return session;
}
```

### 2.3 Aplicar em todas as Server Actions

Padrão a seguir em TODA action:

```ts
export async function criarPaciente(formData: unknown) {
  // 1. auth
  const session = await requireAuth();
  // 2. authz
  authorize(session, 'create', 'paciente');
  // 3. validação
  const parsed = pacienteSchema.parse(formData);
  // 4. banco
  return await prisma.paciente.create({ data: parsed });
}
```

Aplicar em: `criar-paciente.ts`, `atualizar-paciente.ts`, `deletar-paciente.ts`,
`criar-compromisso.ts`, `atualizar-compromisso.ts`, `deletar-compromisso.ts`,
`criar-procedimento.ts`, `atualizar-procedimento.ts`, `deletar-procedimento.ts`

### 2.4 Middleware de rota

Criar `src/middleware.ts` na raiz:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  // verificar sessão
  // redirecionar para /login se não autenticado
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Fase 3 — Rate Limiting (ALTA)

**Por que antes dos headers:** brute force é o vetor mais imediato agora que haverá login.

### 3.1 Instalar

```bash
pnpm add rate-limiter-flexible
```

Para produção com Redis:

```bash
pnpm add ioredis
```

### 3.2 Criar `src/lib/rateLimit.ts`

```ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const loginLimiter = new RateLimiterMemory({
  points: 5, // tentativas
  duration: 900, // por 15 minutos
});

export async function checkLoginRateLimit(ip: string): Promise<void> {
  try {
    await loginLimiter.consume(ip);
  } catch {
    throw new Error('Muitas tentativas. Tente novamente em 15 minutos.');
  }
}
```

### 3.3 Aplicar no endpoint de login

```ts
// antes de qualquer lógica:
const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
await checkLoginRateLimit(ip);
```

---

## Fase 4 — HTTP Security Headers (ALTA)

**1 hora de trabalho, alto impacto.**

### 4.1 Atualizar `next.config.ts`

```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@react-pdf/renderer'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

---

## Fase 5 — Validação Zod (fortalecer o que existe)

**Zod 4 já está instalado e schemas existem. Ajustes pontuais.**

### 5.1 Problema atual nos schemas

Os schemas existentes (`paciente-schema.ts`, `compromisso-schema.ts`, `procedimento-schema.ts`)
não rejeitam campos extras. No Zod 4, `.strip()` é o padrão, mas é preciso garantir.

Verificar se algum schema usa `.passthrough()` e remover.

### 5.2 Selects explícitos no Prisma

Criar `src/lib/types.ts` com tipos de retorno seguros:

```ts
// nunca retornar senhaHash, tentativas, bloqueadoAte
export type UsuarioPublico = {
  id: string;
  email: string;
  role: string;
};
```

Em todas as queries de `Usuario`, usar:

```ts
select: { id: true, email: true, role: true }
```

### 5.3 Nunca spread direto (já parcialmente correto — verificar)

Padrão atual das actions usa `validated.data` do `safeParse` — isso já é correto.
Confirmar que nenhuma action passa `formData` diretamente sem parse.

---

## Fase 6 — Auditoria (MÉDIA)

### 6.1 Adicionar ao schema Prisma

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  usuarioId String?
  acao      String
  recurso   String
  recursoId String?
  ip        String?
  payload   Json?
  criadoEm DateTime @default(now())

  @@map("audit_logs")
}
```

### 6.2 Criar `src/lib/audit.ts`

```ts
import { prisma } from './prisma';

interface AuditoriaParams {
  usuarioId?: string;
  acao: string;
  recurso: string;
  recursoId?: string;
  ip?: string;
  payload?: Record<string, unknown>;
}

export async function registrar(params: AuditoriaParams): Promise<void> {
  await prisma.auditLog.create({ data: params });
}
```

### 6.3 Eventos a registrar

| Ação           | Recurso       |
| -------------- | ------------- |
| `login`        | `usuario`     |
| `login_falhou` | `usuario`     |
| `logout`       | `usuario`     |
| `criar`        | cada entidade |
| `atualizar`    | cada entidade |
| `deletar`      | cada entidade |

---

## Fase 7 — Separação de camadas (MÉDIA)

**Refatorar junto com as fases 1 e 2 para não ter retrabalho.**

### 7.1 Estrutura de diretórios proposta

```
src/
  actions/         # já existe — apenas orquestra
  services/        # CRIAR — regra de negócio
  repositories/    # CRIAR — queries Prisma
  lib/
    auth/          # CRIAR — password, session, authorize, requireAuth
    audit.ts       # CRIAR
    rateLimit.ts   # CRIAR
    schemas/       # já existe
```

### 7.2 Fluxo por camada

```
Action → validate (Zod) → requireAuth → authorize → service → repository → audit → retorno
```

### 7.3 Exemplo de repository

```ts
// src/repositories/paciente.repository.ts
import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/prisma';

export const pacienteRepository = {
  async criar(data: Prisma.PacienteCreateInput) {
    return prisma.paciente.create({ data });
  },
  async listar() {
    return prisma.paciente.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        criadoEm: true,
      },
    });
  },
};
```

---

## Fase 8 — CSRF (BAIXA — Next.js já cobre parcialmente)

**Server Actions têm proteção CSRF nativa do Next.js via origin checking.**
Para as rotas de API em `src/app/api/`:

### 8.1 Verificação de origin nas rotas de API

Criar `src/lib/csrf.ts`:

```ts
export function verificarOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin) return; // mesma origem (sem header origin)
  if (!origin.includes(host ?? '')) {
    throw new Error('CSRF: origin inválido');
  }
}
```

Aplicar em `src/app/api/exportar/route.ts` e `src/app/api/recibo/[id]/route.ts`.

---

## Fase 9 — Variáveis de ambiente (BAIXA)

### 9.1 Situação atual

`.env` contém:

```
DATABASE_URL="postgresql://docker:docker@localhost:5432/agendamentos?schema=public"
```

Credenciais `docker:docker` são apenas para desenvolvimento local — OK por enquanto.

### 9.2 Para produção, adicionar ao `.env.example`

```
DATABASE_URL=""
SESSION_SECRET=""          # string aleatória de 32+ chars
NODE_ENV="production"
```

### 9.3 Regra

Nunca usar `NEXT_PUBLIC_` para segredos.
Atualmente o projeto não usa — manter assim.

---

## Fase 10 — PostgreSQL seguro (BAIXA — infra de produção)

### 10.1 Usuário com permissões mínimas

```sql
CREATE USER agendamentos_app WITH PASSWORD 'senha_forte_aqui';
GRANT CONNECT ON DATABASE agendamentos TO agendamentos_app;
GRANT USAGE ON SCHEMA public TO agendamentos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agendamentos_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agendamentos_app;
```

### 10.2 SSL na connection string (produção)

```
DATABASE_URL="postgresql://agendamentos_app:senha@host:5432/agendamentos?sslmode=require"
```

### 10.3 docker-compose.yml (desenvolvimento)

Trocar credenciais padrão `docker:docker` por algo menos óbvio mesmo em dev:

```yaml
environment:
  POSTGRES_USER: agendamentos_dev
  POSTGRES_PASSWORD: dev_senha_local
  POSTGRES_DB: agendamentos
```

---

## Checklist de progresso

### Fase 1 — Autenticação ✅ (commit c8418ed)

- [x] Modelo `Usuario` e `Session` no schema
- [x] Migração no banco
- [x] `src/lib/auth/password.ts` com argon2
- [x] `src/lib/schemas/auth-schema.ts`
- [x] `src/lib/auth/session.ts` com iron-session
- [x] `SESSION_SECRET` no .env
- [x] Action de login com bloqueio por tentativas
- [x] Action de logout com revogação no banco
- [x] Página `/login`

### Fase 2 — Autorização (parcial — 2026-02-27)

- [ ] `src/lib/auth/authorize.ts` com RBAC
- [x] `src/lib/auth/requireAuth.ts`
- [ ] Todas as Server Actions protegidas
- [x] `src/middleware.ts` redirecionando rotas protegidas

### Fase 3 — Rate Limiting ✅ (2026-02-27)

- [x] `pnpm add rate-limiter-flexible`
- [x] `src/lib/rateLimit.ts`
- [x] Aplicado no login

### Fase 4 — HTTP Headers

- [ ] `next.config.ts` com security headers

### Fase 5 — Zod

- [ ] Confirmar que nenhum schema usa `.passthrough()`
- [ ] Selects explícitos em queries de `Usuario`

### Fase 6 — Auditoria

- [ ] Modelo `AuditLog` no schema
- [ ] `src/lib/audit.ts`
- [ ] Chamadas de auditoria nas actions

### Fase 7 — Separação de camadas

- [ ] Criar `src/repositories/`
- [ ] Criar `src/services/`

### Fase 8 — CSRF

- [ ] `src/lib/csrf.ts`
- [ ] Aplicado nas rotas de API

### Fase 9 — Variáveis de ambiente

- [ ] `.env.example` completo

### Fase 10 — PostgreSQL

- [ ] Usuário com permissões mínimas (produção)
- [ ] SSL na connection string (produção)
- [ ] Credenciais do docker-compose atualizadas
