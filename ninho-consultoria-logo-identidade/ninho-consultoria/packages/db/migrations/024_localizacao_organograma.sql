-- ============================================================
-- Ninho Consultoria — Migration 024: Localização e Organograma
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table clientes add column if not exists latitude numeric;
alter table clientes add column if not exists longitude numeric;

create table if not exists clientes_organograma (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  nome text not null,
  cargo text,
  reporta_a_id uuid references clientes_organograma(id) on delete set null,
  created_at timestamptz default now()
);

alter table clientes_organograma enable row level security;
create policy "temp_allow_all_clientes_organograma" on clientes_organograma for all using (true) with check (true);

-- ============================================================
-- Fim da migration 024
-- ============================================================
