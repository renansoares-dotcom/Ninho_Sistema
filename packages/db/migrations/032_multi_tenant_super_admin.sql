-- ============================================================
-- Ninho Consultoria — Migration 032: Multi-tenant real + Super Admin
-- Rodar no SQL Editor do Supabase (Project > SQL Editor > New query)
--
-- Reconstrução em arquivo do que foi rodado manualmente (por texto, direto
-- no SQL Editor) antes das ferramentas de arquivo voltarem a funcionar
-- nessa etapa. Reproduzido aqui para o histórico de migrations ficar
-- completo — quem recriar o banco do zero precisa deste passo entre a
-- 031 e a 033.
--
-- O que essa migration faz:
--   1. Cria "super_admins" — fica FORA do modelo de tenant (um super admin
--      não pertence a um escritório específico, gerencia todos).
--   2. Adiciona "tenants.slug" — usado na URL do Diagnóstico Público por
--      escritório (/diagnostico-publico/[slug]).
--   3. Corrige o gatilho "handle_new_user" (criado na migration 025) para
--      ler o tenant_id do metadata do convite, em vez de sempre cair no
--      primeiro tenant cadastrado — é o que destrava o multi-tenant de
--      verdade (a rota app/api/super-admin/criar-tenant já envia
--      tenant_id no metadata ao convidar o primeiro Admin de um
--      escritório novo).
--
-- Nota: "super_admins" fica sem RLS habilitado até a migration 033, que
-- fecha esse ponto (ver comentário na 033).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabela de Super Admins
-- ------------------------------------------------------------
create table if not exists super_admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. Slug único por tenant (URL do Diagnóstico Público)
-- ------------------------------------------------------------
alter table tenants add column if not exists slug text unique;
update tenants set slug = 'principal' where slug is null;

-- ------------------------------------------------------------
-- 3. Corrige o gatilho de criação de usuário pra ler o tenant_id do
--    metadata (substitui a versão da migration 025)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;

  if v_tenant_id is null then
    select id into v_tenant_id from public.tenants order by created_at asc limit 1;
  end if;

  insert into public.profiles (id, tenant_id, nome, email, role, ativo)
  values (
    new.id,
    v_tenant_id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'consultor'),
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ============================================================
-- Fim da migration 032
-- ============================================================
