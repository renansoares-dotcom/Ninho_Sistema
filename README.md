# Ninho Consultoria

Plataforma SaaS multi-tenant para gestão completa de consultorias empresariais — do lead à entrega de resultados, em um único ambiente.

## Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts
- **Backend**: FastAPI (Python)
- **Banco de dados**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **IA**: OpenAI API

## Status do projeto

| Fase | Status |
|---|---|
| 1. Arquitetura | ✅ concluída — ver `docs/arquitetura/` |
| 2. Interface | ✅ concluída — todos os módulos, ver `docs/prototipos/` e `docs/design/` |
| 3. Backend / Banco / CRUD | ✅ concluída — Supabase conectado em todos os módulos |
| 4. Login/Auth + RLS por perfil | ✅ concluída — ver `docs/arquitetura/guia-login-auth.md` |
| 5. Portal do Cliente, IA consultora, multi-tenant | ⬜ não iniciadas — ver `docs/arquitetura/pendencias-por-complexidade.md` |

## Estrutura do repositório

```
ninho-consultoria/
├── apps/
│   ├── web/     → Next.js (frontend)
│   └── api/     → FastAPI (backend)
├── packages/
│   ├── db/      → migrations e seeds do Supabase
│   └── config/  → configs compartilhadas (eslint, tsconfig, tailwind)
└── docs/
    ├── arquitetura/  → modelo de dados, endpoints, estrutura de pastas
    ├── design/       → diretrizes de UI/UX (design system)
    └── prototipos/   → protótipos de tela (React)
```

Detalhes completos de cada módulo, entidades do banco e contratos de API estão em `docs/arquitetura/ninho-consultoria-arquitetura.md`.

## Perfis de usuário

Administrador, Diretor, Coordenador, Consultor, Financeiro e Cliente (Portal). Controle de acesso via RLS no Supabase por `tenant_id` + `role` + vínculo direto com o registro. Login real via Supabase Auth — passo a passo de ativação em `docs/arquitetura/guia-login-auth.md`.

## Como rodar

```bash
cd apps/web
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Antes do primeiro acesso, rode as migrations em `packages/db/migrations/` (em ordem, no SQL Editor do Supabase) e siga `docs/arquitetura/guia-login-auth.md` para criar o primeiro usuário Admin.

## Contribuindo

Padrão de módulo no backend: `router.py` → `service.py` → `repository.py` → `schemas.py`.
Padrão de tela no frontend: cards agrupados por tema, menu superior (sem sidebar), componentes Shadcn/UI.
