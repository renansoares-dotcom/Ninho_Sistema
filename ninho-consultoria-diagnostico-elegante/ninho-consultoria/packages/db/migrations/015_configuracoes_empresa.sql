-- ============================================================
-- Ninho Consultoria — Migration 015: Configurações da Empresa
-- Rodar no SQL Editor do Supabase
-- ============================================================

create table if not exists configuracoes_empresa (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade unique,
  razao_social text,
  nome_fantasia text,
  cnpj text,
  inscricao_municipal text,
  inscricao_estadual text,
  regime_tributario text,
  logradouro text,
  cidade text,
  uf text,
  cep text,
  telefone text,
  email_envio_notas text,
  codigo_servico_padrao text,
  aliquota_iss numeric,
  serie_nfe text default '1',
  proximo_numero_nfe int default 1,
  ambiente_nfe text default 'Homologação',
  focus_nfe_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table configuracoes_empresa enable row level security;
create policy "temp_allow_all_configuracoes_empresa" on configuracoes_empresa for all using (true) with check (true);

-- Linha inicial vazia para o tenant já existente
insert into configuracoes_empresa (tenant_id, razao_social)
values ('00000000-0000-0000-0000-000000000001', 'Ninho Consultoria')
on conflict (tenant_id) do nothing;

-- ============================================================
-- Fim da migration 015
-- ============================================================
