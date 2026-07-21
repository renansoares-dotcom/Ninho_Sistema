-- ============================================================
-- Ninho Consultoria — Migration 001: Tabelas principais
-- Rodar no SQL Editor do Supabase (Project > SQL Editor > New query)
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TENANTS (suporte multi-consultoria)
-- ------------------------------------------------------------
create table tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plano text default 'hobby',
  logo_url text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- PROFILES (usuários do sistema, vinculados ao auth.users)
-- ------------------------------------------------------------
create type user_role as enum ('admin', 'diretor', 'coordenador', 'consultor', 'financeiro', 'cliente');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  email text not null,
  role user_role not null default 'consultor',
  avatar_url text,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
create table clientes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  razao_social text not null,
  nome_fantasia text,
  cnpj text,
  segmento text,
  porte text,
  num_funcionarios int,
  faturamento numeric,
  endereco jsonb,
  status text default 'Ativo',
  responsavel_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table clientes_contatos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  nome text not null,
  cargo text,
  telefone text,
  email text,
  principal boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CRM — LEADS / OPORTUNIDADES
-- ------------------------------------------------------------
create type etapa_funil as enum ('lead', 'contato', 'reuniao', 'diagnostico', 'proposta', 'negociacao', 'contrato', 'cliente_ativo');

create table leads_oportunidades (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  empresa_nome text not null,
  responsavel_id uuid references profiles(id),
  telefone text,
  email text,
  origem text,
  etapa etapa_funil default 'lead',
  valor_estimado numeric,
  probabilidade int default 0,
  observacoes text,
  cliente_id uuid references clientes(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table oportunidade_atividades (
  id uuid primary key default gen_random_uuid(),
  oportunidade_id uuid references leads_oportunidades(id) on delete cascade,
  tipo text not null,
  descricao text,
  data timestamptz default now(),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- AGENDA
-- ------------------------------------------------------------
create type tipo_evento as enum ('reuniao', 'visita_tecnica', 'videoconferencia');

create table eventos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  titulo text not null,
  tipo tipo_evento not null,
  cliente_id uuid references clientes(id),
  responsavel_id uuid references profiles(id),
  data_inicio timestamptz not null,
  data_fim timestamptz,
  local_ou_link text,
  status text default 'Agendado',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- KANBAN
-- ------------------------------------------------------------
create table projetos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  cliente_id uuid references clientes(id),
  responsavel_id uuid references profiles(id),
  status text default 'Ativo',
  created_at timestamptz default now()
);

create table tarefas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  projeto_id uuid references projetos(id) on delete cascade,
  cliente_id uuid references clientes(id),
  titulo text not null,
  descricao text,
  coluna text default 'afazer',
  responsavel_id uuid references profiles(id),
  prioridade text default 'Média',
  data_inicio date,
  data_conclusao date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- DIAGNÓSTICO EMPRESARIAL
-- ------------------------------------------------------------
create table diagnosticos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  data date default current_date,
  status text default 'Em preenchimento',
  indice_maturidade_geral numeric,
  resumo_executivo text,
  pontos_fortes jsonb default '[]',
  oportunidades_melhoria jsonb default '[]',
  created_at timestamptz default now()
);

create table diagnostico_areas (
  id uuid primary key default gen_random_uuid(),
  diagnostico_id uuid references diagnosticos(id) on delete cascade,
  area text not null,
  nota numeric check (nota >= 0 and nota <= 10),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- PLANO DE TRABALHO
-- ------------------------------------------------------------
create table planos_trabalho (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  diagnostico_id uuid references diagnosticos(id),
  status text default 'Ativo',
  created_at timestamptz default now()
);

create table plano_acoes (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid references planos_trabalho(id) on delete cascade,
  titulo text not null,
  responsavel_id uuid references profiles(id),
  prioridade text default 'Média',
  prazo date,
  status text default 'Pendente',
  observacoes text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- VISITAS / REGISTRO DE CONSULTORIA
-- ------------------------------------------------------------
create table visitas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  consultor_id uuid references profiles(id),
  data date default current_date,
  hora time,
  objetivo text,
  relato text,
  decisoes text,
  pendencias text,
  assinatura_url text,
  proxima_visita_id uuid references visitas(id),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- KPIS
-- ------------------------------------------------------------
create table kpi_definicoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  nome text not null,
  unidade text,
  created_at timestamptz default now()
);

create table kpi_valores (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid references kpi_definicoes(id) on delete cascade,
  data_referencia date not null,
  valor numeric not null,
  tipo text default 'atual',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- FINANCEIRO
-- ------------------------------------------------------------
create table contratos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  valor_total numeric not null,
  num_parcelas int default 1,
  data_inicio date,
  data_fim date,
  status text default 'Ativo',
  created_at timestamptz default now()
);

create table contrato_parcelas (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid references contratos(id) on delete cascade,
  numero int not null,
  valor numeric not null,
  vencimento date not null,
  status text default 'Pendente',
  data_pagamento date,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- ARQUIVOS
-- ------------------------------------------------------------
create table arquivos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  url text not null,
  categoria text,
  cliente_id uuid references clientes(id),
  projeto_id uuid references projetos(id),
  visita_id uuid references visitas(id),
  diagnostico_id uuid references diagnosticos(id),
  contrato_id uuid references contratos(id),
  versao int default 1,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- COMUNICAÇÃO
-- ------------------------------------------------------------
create table comentarios (
  id uuid primary key default gen_random_uuid(),
  entidade_tipo text not null,
  entidade_id uuid not null,
  autor_id uuid references profiles(id),
  texto text not null,
  created_at timestamptz default now()
);

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tipo text,
  titulo text not null,
  lida boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- AUTOMAÇÕES
-- ------------------------------------------------------------
create table automacoes_regras (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  gatilho text not null,
  condicao jsonb default '{}',
  acao jsonb default '{}',
  ativa boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Fim da migration 001
-- ============================================================
