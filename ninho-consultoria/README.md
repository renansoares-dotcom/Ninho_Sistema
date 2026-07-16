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
| 2. Interface | 🔶 em andamento — Dashboard Executivo + CRM prontos, ver `docs/prototipos/` e `docs/design/` |
| 3. Backend | ⬜ não iniciada |
| 4. Integrações | ⬜ não iniciada |

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

Administrador, Diretor, Coordenador, Consultor, Financeiro e Cliente (Portal). Controle de acesso via RLS no Supabase por `tenant_id` + `role` + vínculo direto com o registro.

## Como rodar (a preencher na Fase 3)

Instruções de setup local do frontend e backend serão adicionadas quando o backend for implementado.

## Contribuindo

Padrão de módulo no backend: `router.py` → `service.py` → `repository.py` → `schemas.py`.
Padrão de tela no frontend: cards agrupados por tema, menu superior (sem sidebar), componentes Shadcn/UI.
