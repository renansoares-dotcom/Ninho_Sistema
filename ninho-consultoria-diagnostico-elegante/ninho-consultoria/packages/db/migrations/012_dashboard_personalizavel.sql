-- ============================================================
-- Ninho Consultoria — Migration 012: Dashboard personalizável
-- Rodar no SQL Editor do Supabase
-- ============================================================

create table if not exists dashboard_preferencias (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  widget_id text not null,
  visivel boolean default true,
  ordem int default 0,
  created_at timestamptz default now(),
  unique (tenant_id, widget_id)
);

alter table dashboard_preferencias enable row level security;
create policy "temp_allow_all_dashboard_preferencias" on dashboard_preferencias for all using (true) with check (true);

-- ============================================================
-- Fim da migration 012
-- ============================================================
