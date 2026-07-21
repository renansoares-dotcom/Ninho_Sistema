-- ============================================================
-- Ninho Consultoria — Migration 029: Logo / Identidade Visual por tenant
-- Rodar no SQL Editor do Supabase (depois de 025 em diante)
-- ============================================================

alter table configuracoes_empresa add column if not exists logo_url text;

-- Bucket público dedicado a assets de marca (logo). Separado do bucket
-- "arquivos" (documentos de clientes) porque a logo precisa ser lida até
-- por visitantes anônimos no Diagnóstico Público e nas telas de login.
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logos_storage_select" on storage.objects;
drop policy if exists "logos_storage_write" on storage.objects;

create policy "logos_storage_select" on storage.objects for select
  using (bucket_id = 'logos');
create policy "logos_storage_write" on storage.objects for all
  using (bucket_id = 'logos' and auth_is_gestao())
  with check (bucket_id = 'logos' and auth_is_gestao());

-- ============================================================
-- Fim da migration 029
-- ============================================================
