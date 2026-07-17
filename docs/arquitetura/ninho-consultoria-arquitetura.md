# Ninho Consultoria — Plano de Desenvolvimento em 4 Fases

Dividi o projeto em **4 fases sequenciais**, exatamente como você pediu. Cada fase só começa quando a anterior está fechada e validada — isso evita retrabalho e "perda de rumo" no meio do caminho.

| Fase | Entregável | Conteúdo |
|---|---|---|
| **1. Arquitetura** | Este documento | UX/fluxos, modelo de dados, contratos de API, estrutura de pastas |
| **2. Interface** | Design system + telas | Componentes Shadcn/UI, layouts, protótipos navegáveis (mock data) |
| **3. Backend** | API funcional | FastAPI + Supabase, regras de negócio, autenticação, permissões |
| **4. Integrações** | Produto completo | OpenAI, geração de PDF, Google Calendar, notificações, automações |

Abaixo está a **Fase 1 completa**. Ao final, te digo o que precisa de decisão sua antes de eu avançar para a Fase 2.

---

## 1. Perfis de Usuário e Permissões

| Perfil | Acesso |
|---|---|
| **Administrador** | Acesso total: configurações, usuários, faturamento da plataforma, todos os clientes/consultores |
| **Diretor** | Dashboards executivos, financeiro, todos os projetos e consultores, sem configurações de sistema |
| **Coordenador** | Gestão de uma carteira de consultores/clientes, aprova planos de trabalho, sem acesso financeiro global |
| **Consultor** | Seus clientes, agenda, kanban, diagnósticos, registros de visita, IA de apoio |
| **Financeiro** | Contratos, parcelas, inadimplência, comissões — sem acesso a CRM/kanban |
| **Cliente** (Portal) | Somente seus próprios dados: plano de trabalho, indicadores, arquivos, agenda, mensagens |

Regra geral: **Row Level Security (RLS) no Supabase** aplicada por `tenant_id` (multi-empresa/multi-consultoria) + `role` + vínculo direto (ex: consultor só vê `clientes` onde ele é `responsavel_id`, cliente só vê registros da própria `empresa_id`).

---

## 2. Fluxo Macro entre Módulos

```
Lead (CRM) → Contato → Reunião → Diagnóstico → Proposta → Negociação
   → Contrato Assinado → Cliente Ativo
        ├── Diagnóstico Empresarial → gera → Plano de Trabalho
        ├── Plano de Trabalho → gera → Tarefas (Kanban)
        ├── Agenda → Registro de Visita → Timeline 360°
        ├── KPIs (inicial vs atual) → Dashboard ROI
        ├── Financeiro (parcelas, recebimentos) → Score de Saúde do Cliente
        └── Portal do Cliente → consome tudo acima (somente leitura + mensagens)
```

Esse encadeamento é o núcleo do produto: **CRM → Diagnóstico → Plano → Execução → Indicadores → ROI**. Toda decisão de modelagem abaixo protege esse fluxo.

---

## 3. Estrutura de Pastas (Monorepo)

```
ninho-consultoria/
├── apps/
│   ├── web/                          # Next.js (App Router) + TS
│   │   ├── app/
│   │   │   ├── (auth)/               # login, recuperação de senha
│   │   │   ├── (app)/                # área logada interna
│   │   │   │   ├── dashboard/
│   │   │   │   ├── crm/
│   │   │   │   ├── clientes/
│   │   │   │   ├── agenda/
│   │   │   │   ├── kanban/
│   │   │   │   ├── diagnostico/
│   │   │   │   ├── plano-trabalho/
│   │   │   │   ├── visitas/
│   │   │   │   ├── kpis/
│   │   │   │   ├── financeiro/
│   │   │   │   ├── arquivos/
│   │   │   │   ├── relatorios/
│   │   │   │   ├── comunicacao/
│   │   │   │   ├── automacoes/
│   │   │   │   └── configuracoes/
│   │   │   └── (portal-cliente)/     # subdomínio ou rota isolada
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn base
│   │   │   ├── shared/                # componentes reutilizáveis do domínio
│   │   │   └── charts/                # wrappers Recharts
│   │   ├── lib/                       # supabase client, api client, utils
│   │   ├── hooks/
│   │   ├── types/                     # tipos gerados a partir do schema
│   │   └── styles/
│   └── api/                           # FastAPI
│       ├── app/
│       │   ├── main.py
│       │   ├── core/                  # config, security, deps
│       │   ├── modules/
│       │   │   ├── crm/               # router, schemas, services, repository
│       │   │   ├── clientes/
│       │   │   ├── agenda/
│       │   │   ├── kanban/
│       │   │   ├── diagnostico/
│       │   │   ├── plano_trabalho/
│       │   │   ├── visitas/
│       │   │   ├── kpis/
│       │   │   ├── financeiro/
│       │   │   ├── arquivos/
│       │   │   ├── relatorios/
│       │   │   ├── comunicacao/
│       │   │   ├── automacoes/
│       │   │   ├── ia/                # integração OpenAI
│       │   │   └── auth/
│       │   └── shared/                # exceptions, middlewares, utils
│       └── tests/
├── packages/
│   ├── db/                            # migrations SQL (Supabase), seeds
│   └── config/                        # eslint, tsconfig, tailwind config compartilhados
└── docs/
    └── arquitetura/                   # este documento e evoluções dele
```

**Padrão por módulo no backend:** `router.py` (endpoints) → `service.py` (regra de negócio) → `repository.py` (acesso a dados) → `schemas.py` (Pydantic). Isso mantém SOLID e evita lógica de negócio dentro dos endpoints.

---

## 4. Modelo de Dados (Entidades Principais)

> Convenção: toda tabela tem `id (uuid)`, `tenant_id`, `created_at`, `updated_at`, `created_by`. Omitidos abaixo por brevidade.

### 4.1 Identidade e Acesso
- **`profiles`** — vinculado ao `auth.users` do Supabase: `nome`, `email`, `role` (enum: admin, diretor, coordenador, consultor, financeiro, cliente), `avatar_url`, `ativo`
- **`tenants`** — suporte multi-consultoria (caso vire SaaS multi-empresa): `nome`, `plano`, `logo_url`

### 4.2 CRM Comercial
- **`leads_oportunidades`** — `empresa_nome`, `responsavel_id`, `telefone`, `email`, `origem`, `etapa` (enum: lead, contato, reuniao, diagnostico, proposta, negociacao, contrato, cliente_ativo), `valor_estimado`, `probabilidade`, `cliente_id` (nulo até virar cliente)
- **`oportunidade_atividades`** — histórico de contatos/interações: `oportunidade_id`, `tipo`, `descricao`, `data`
- **`oportunidade_anexos`** — `oportunidade_id`, `arquivo_id`

### 4.3 Clientes (Empresas)
- **`clientes`** — `razao_social`, `nome_fantasia`, `cnpj`, `segmento`, `porte`, `num_funcionarios`, `faturamento`, `endereco` (jsonb), `status`
- **`clientes_contatos`** — `cliente_id`, `nome`, `cargo`, `setor`, `telefone`, `email`, `principal (bool)`
- **`clientes_responsaveis`** — vínculo `cliente_id` ↔ `profile_id` (consultor/coordenador responsável)

### 4.4 Agenda
- **`eventos`** — `titulo`, `tipo` (reuniao, visita_tecnica, videoconferencia), `cliente_id`, `responsavel_id`, `data_inicio`, `data_fim`, `local_ou_link`, `status`
- **`eventos_participantes`** — `evento_id`, `profile_id` ou `contato_id`
- **`lembretes`** — `evento_id`, `canal`, `enviado_em`

### 4.5 Kanban / Projetos
- **`projetos`** — `nome`, `cliente_id`, `responsavel_id`, `status`
- **`quadros`** (boards) → **`colunas`** → **`tarefas`**
- **`tarefas`** — `titulo`, `descricao`, `coluna_id`, `responsavel_id`, `prioridade`, `data_inicio`, `data_conclusao`, `tempo_estimado`, `tempo_gasto`
- **`tarefas_checklist`**, **`tarefas_comentarios`**, **`tarefas_anexos`**, **`tarefas_etiquetas`**, **`tarefas_dependencias`** (self-relation `tarefa_id` → `depende_de_id`)

### 4.6 Diagnóstico Empresarial
- **`diagnosticos`** — `cliente_id`, `data`, `status`, `indice_maturidade_geral`
- **`diagnostico_areas`** — `diagnostico_id`, `area` (financeiro, rh, marketing, comercial, producao, fiscal, compras, estoque, gestao), `nota`
- **`diagnostico_perguntas`** (template reutilizável) — `area`, `pergunta`, `peso`
- **`diagnostico_respostas`** — `diagnostico_id`, `pergunta_id`, `resposta`, `nota`
- **`diagnostico_resumo`** — `diagnostico_id`, `pontos_fortes` (jsonb), `oportunidades` (jsonb), `resumo_executivo` (texto gerado por IA)

### 4.7 Plano de Trabalho
- **`planos_trabalho`** — `cliente_id`, `diagnostico_id` (origem), `status`
- **`plano_acoes`** — `plano_id`, `titulo`, `responsavel_id`, `prioridade`, `prazo`, `status`, `observacoes`
- **`plano_acoes_anexos`**

### 4.8 Registro de Visitas / Consultorias
- **`visitas`** — `cliente_id`, `consultor_id`, `data`, `hora`, `objetivo`, `relato`, `decisoes`, `pendencias`, `assinatura_url`, `proxima_visita_id` (self-relation)
- **`visitas_fotos`**, **`visitas_anexos`**

### 4.9 KPIs
- **`kpi_definicoes`** — `nome`, `unidade`, `cliente_id`
- **`kpi_valores`** — `kpi_id`, `data_referencia`, `valor`, `tipo` (baseline, atual)

### 4.10 Financeiro
- **`contratos`** — `cliente_id`, `valor_total`, `num_parcelas`, `data_inicio`, `data_fim`, `status`
- **`contrato_parcelas`** — `contrato_id`, `numero`, `valor`, `vencimento`, `status` (pendente, pago, atrasado), `data_pagamento`
- **`comissoes`** — `consultor_id`, `contrato_id`, `percentual`, `valor`, `status`

### 4.11 Arquivos
- **`arquivos`** — `nome`, `url` (Supabase Storage), `categoria`, `cliente_id`, `projeto_id`, `visita_id`, `diagnostico_id`, `contrato_id`, `versao`

### 4.12 Comunicação e Satisfação
- **`comentarios`** — polimórfico: `entidade_tipo`, `entidade_id`, `autor_id`, `texto`, `mencoes` (jsonb)
- **`notificacoes`** — `profile_id`, `tipo`, `titulo`, `lida (bool)`, `link`
- **`pesquisas_nps`** — `cliente_id`, `visita_id` ou `consultoria_id`, `nota`, `comentario`

### 4.13 Automações
- **`automacoes_regras`** — `gatilho` (ex: diagnostico_concluido, contrato_vencendo), `condicao` (jsonb), `acao` (jsonb)
- **`automacoes_execucoes`** — log de execuções

### Diagrama de relacionamento (visão simplificada)

```
tenants ─┬─ profiles
         ├─ leads_oportunidades ── clientes ─┬─ clientes_contatos
         │                                    ├─ eventos
         │                                    ├─ projetos ── tarefas
         │                                    ├─ diagnosticos ── planos_trabalho ── plano_acoes
         │                                    ├─ visitas
         │                                    ├─ kpi_valores
         │                                    ├─ contratos ── contrato_parcelas
         │                                    └─ arquivos
         └─ automacoes_regras
```

---

## 5. Contratos de API (visão por módulo)

Padrão REST, prefixo `/api/v1`, autenticação via JWT do Supabase Auth em todas as rotas.

| Módulo | Endpoints principais |
|---|---|
| **auth** | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| **crm** | `GET/POST /oportunidades`, `PATCH /oportunidades/{id}/etapa`, `GET /oportunidades/{id}/atividades` |
| **clientes** | `GET/POST/PATCH /clientes`, `GET /clientes/{id}/timeline` (Timeline 360°), `GET /clientes/{id}/score-saude` |
| **agenda** | `GET/POST /eventos`, `PATCH /eventos/{id}`, `GET /agenda/consultor/{id}` |
| **kanban** | `GET/POST /projetos`, `GET /projetos/{id}/quadro`, `POST /tarefas`, `PATCH /tarefas/{id}/mover` |
| **diagnostico** | `POST /diagnosticos`, `POST /diagnosticos/{id}/respostas`, `GET /diagnosticos/{id}/resultado` (notas + radar) |
| **plano-trabalho** | `POST /planos-trabalho/gerar-de-diagnostico/{diagnostico_id}`, `GET/PATCH /plano-acoes/{id}` |
| **visitas** | `POST /visitas`, `GET /clientes/{id}/visitas`, `POST /visitas/{id}/assinatura` |
| **kpis** | `GET/POST /kpis`, `GET /clientes/{id}/kpis/comparativo` (baseline vs atual) |
| **financeiro** | `GET/POST /contratos`, `GET /contratos/{id}/parcelas`, `PATCH /parcelas/{id}/pagamento`, `GET /financeiro/inadimplencia` |
| **arquivos** | `POST /arquivos/upload`, `GET /arquivos?entidade=...` |
| **relatorios** | `POST /relatorios/diagnostico/{id}/pdf`, `POST /relatorios/plano-trabalho/{id}/pdf`, `POST /relatorios/visita/{id}/pdf` |
| **comunicacao** | `GET/POST /comentarios`, `GET /notificacoes`, `PATCH /notificacoes/{id}/lida` |
| **automacoes** | `GET/POST /automacoes-regras`, `GET /automacoes/execucoes` |
| **ia** | `POST /ia/resumir-reuniao`, `POST /ia/sugerir-plano-acao`, `POST /ia/gerar-diagnostico-preliminar`, `POST /ia/redigir-email` |
| **portal-cliente** | `GET /portal/dashboard`, `GET /portal/plano-trabalho`, `GET /portal/arquivos`, `POST /portal/mensagens` |

Cada endpoint de listagem suporta paginação, filtros e ordenação padronizados (`?page=&limit=&sort=&filter[campo]=`).

---

## 6. Roadmap de Desenvolvimento (visão geral das 4 fases)

1. **Arquitetura** *(este documento)* — validar modelo de dados, permissões e endpoints antes de escrever qualquer código.
2. **Interface** — design system (cores, tipografia, tema claro/escuro), componentes base, protótipo navegável com dados mockados de todos os módulos, sem backend real ainda.
3. **Backend** — schema real no Supabase (migrations), FastAPI com regras de negócio e RLS, conectado ao frontend já pronto.
4. **Integrações** — OpenAI (resumos, sugestões, diagnóstico preliminar), geração de PDF, notificações, automações, Google Calendar.

---

## O que preciso de você antes da Fase 2

1. **Nome/identidade visual**: já existe logo, paleta de cores ou é para eu propor uma identidade do zero (premium, minimalista)?
2. **Multi-tenant real ou single-tenant**: essa plataforma vai atender várias consultorias (SaaS multi-cliente) ou é para uma única consultoria usar internamente? Isso muda o modelo de `tenants` e o RLS.
3. **Prioridade de módulos**: para a Fase 2 (interface), você quer que eu comece pelo Dashboard Executivo + CRM (o fluxo comercial), ou prefere começar pelo Diagnóstico + Plano de Trabalho (o core de entrega de valor)?

Me responda esses três pontos e eu já sigo direto para a Fase 2 (Interface) com o design system e as primeiras telas.
