-- ============================================================
-- Ninho Consultoria — Migration 013: Arquivos (Supabase Storage)
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- Cria o bucket de armazenamento (público para simplificar o preview/download por enquanto)
insert into storage.buckets (id, name, public)
values ('arquivos', 'arquivos', true)
on conflict (id) do nothing;

-- Política temporária permissiva para o bucket, no mesmo espírito do restante do banco
-- (será substituída por regras reais por perfil/tenant quando o login existir)
drop policy if exists "temp_allow_all_storage_arquivos" on storage.objects;
create policy "temp_allow_all_storage_arquivos"
  on storage.objects for all
  using (bucket_id = 'arquivos')
  with check (bucket_id = 'arquivos');

-- Campos extras na tabela "arquivos" (já criada na migration 001)
alter table arquivos add column if not exists favorito boolean default false;
alter table arquivos add column if not exists tamanho bigint;
alter table arquivos add column if not exists tipo_arquivo text;

-- ============================================================
-- Fim da migration 013
-- ============================================================
