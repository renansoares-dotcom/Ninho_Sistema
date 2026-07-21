-- ============================================================
-- Ninho Consultoria — Migration 020: Notas Fiscais (Faturamento)
-- Rodar no SQL Editor do Supabase
-- ============================================================

create table if not exists notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cliente_id uuid references clientes(id),
  contrato_id uuid references contratos(id),
  numero int not null,
  serie text default '1',
  valor numeric not null,
  descricao_servico text,
  codigo_servico text,
  aliquota_iss numeric,
  data_emissao date not null,
  status text default 'Emitida',
  ambiente text default 'Homologação',
  chave_acesso text,
  created_at timestamptz default now()
);

alter table notas_fiscais enable row level security;
create policy "temp_allow_all_notas_fiscais" on notas_fiscais for all using (true) with check (true);

-- ============================================================
-- Fim da migration 020
-- ============================================================
