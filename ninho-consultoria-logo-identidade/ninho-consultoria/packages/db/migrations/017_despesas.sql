-- ============================================================
-- Ninho Consultoria — Migration 017: Despesas (Fluxo de Caixa / DRE)
-- Rodar no SQL Editor do Supabase
-- ============================================================

create table if not exists despesas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  descricao text not null,
  categoria text not null,
  valor numeric not null,
  data date not null,
  tipo text default 'Pontual',
  created_at timestamptz default now()
);

alter table despesas enable row level security;
create policy "temp_allow_all_despesas" on despesas for all using (true) with check (true);

-- ------------------------------------------------------------
-- SEED — 10 despesas de exemplo, distribuídas nos últimos meses
-- ------------------------------------------------------------
insert into despesas (tenant_id, descricao, categoria, valor, data, tipo) values
  ('00000000-0000-0000-0000-000000000001', 'Aluguel do escritório', 'Estrutura', 4500, '2026-07-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Folha de pagamento — equipe', 'Pessoal', 38000, '2026-07-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Ferramentas e softwares (SaaS)', 'Tecnologia', 2100, '2026-07-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Contabilidade terceirizada', 'Administrativo', 1800, '2026-07-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Marketing e tráfego pago', 'Marketing', 3200, '2026-07-10', 'Pontual'),
  ('00000000-0000-0000-0000-000000000001', 'Deslocamento — visita Recife/PE', 'Operacional', 650, '2026-07-12', 'Pontual'),
  ('00000000-0000-0000-0000-000000000001', 'Aluguel do escritório', 'Estrutura', 4500, '2026-06-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Folha de pagamento — equipe', 'Pessoal', 36500, '2026-06-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Ferramentas e softwares (SaaS)', 'Tecnologia', 2050, '2026-06-05', 'Recorrente'),
  ('00000000-0000-0000-0000-000000000001', 'Treinamento da equipe', 'Pessoal', 1600, '2026-06-18', 'Pontual');

-- ============================================================
-- Fim da migration 017
-- ============================================================
