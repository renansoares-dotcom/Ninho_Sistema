-- ============================================================
-- Ninho Consultoria — Migration 033: Painel de Super Admin
-- Rodar depois da 032 (super_admins + slug já devem existir)
-- ============================================================

-- ------------------------------------------------------------
-- 0. Fecha o RLS da tabela "super_admins" em si (ficou sem RLS na
--    migration 032, que foi rodada por texto antes das ferramentas de
--    arquivo voltarem — corrigindo aqui). Sem isso, qualquer usuário
--    logado conseguiria consultar essa tabela livremente.
-- ------------------------------------------------------------
alter table super_admins enable row level security;

-- Cada pessoa só consegue checar a PRÓPRIA linha (usado pelo helper
-- exigirSuperAdmin() no app) — não dá pra listar quem mais é super admin.
create policy "super_admins_select_self" on super_admins for select
  using (id = auth.uid());

-- ------------------------------------------------------------
-- 1. Suspensão de tenant — bloqueia login de todo mundo daquele escritório
-- ------------------------------------------------------------
alter table tenants add column if not exists ativo boolean default true;

-- ------------------------------------------------------------
-- 2. Financeiro — assinatura de cada escritório (controle manual, sem
--    gateway de pagamento — é uma ficha de acompanhamento pro super admin)
-- ------------------------------------------------------------
create table if not exists tenant_assinaturas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid unique references tenants(id) on delete cascade,
  plano text default 'Básico',
  valor_mensal numeric default 0,
  status_pagamento text default 'Em dia' check (status_pagamento in ('Em dia', 'Atrasado', 'Cancelado', 'Trial')),
  proximo_vencimento date,
  observacoes text,
  updated_at timestamptz default now()
);

alter table tenant_assinaturas enable row level security;

-- ------------------------------------------------------------
-- 3. RLS: Super Admin enxerga e gerencia TUDO, cruzando tenants
-- ------------------------------------------------------------
create policy "tenants_super_admin" on tenants for all
  using (exists (select 1 from super_admins where id = auth.uid()))
  with check (exists (select 1 from super_admins where id = auth.uid()));

create policy "profiles_super_admin" on profiles for all
  using (exists (select 1 from super_admins where id = auth.uid()))
  with check (exists (select 1 from super_admins where id = auth.uid()));

create policy "tenant_assinaturas_super_admin" on tenant_assinaturas for all
  using (exists (select 1 from super_admins where id = auth.uid()))
  with check (exists (select 1 from super_admins where id = auth.uid()));

-- Cria uma ficha financeira em branco pro(s) tenant(s) que já existem
insert into tenant_assinaturas (tenant_id)
select id from tenants
where not exists (select 1 from tenant_assinaturas where tenant_id = tenants.id);

-- ============================================================
-- Fim da migration 033
-- ============================================================
