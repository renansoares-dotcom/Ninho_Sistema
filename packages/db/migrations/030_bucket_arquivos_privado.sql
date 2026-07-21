-- ============================================================
-- Ninho Consultoria — Migration 030: Bucket "arquivos" privado + links assinados
-- Rodar no SQL Editor do Supabase (depois de 025 em diante)
--
-- Até aqui, o bucket "arquivos" era público — qualquer pessoa com o link
-- direto de um arquivo (mesmo sem login) conseguia abrir, porque buckets
-- públicos no Storage não passam pelo RLS na hora do download. Essa
-- migration fecha isso: o bucket vira privado, e o app passa a gerar um
-- link temporário (assinado, expira em alguns segundos/minutos) toda vez
-- que alguém clica em "Abrir".
-- ============================================================

-- 1. Guarda o CAMINHO do arquivo dentro do bucket (não a URL pública, que
--    deixa de funcionar). Preenche automaticamente a partir da URL antiga
--    pra não perder o histórico de arquivos já enviados.
alter table arquivos add column if not exists caminho text;
update arquivos
set caminho = substring(url from '/storage/v1/object/public/arquivos/(.*)$')
where caminho is null and url is not null;

alter table tarefa_anexos add column if not exists caminho text;
update tarefa_anexos
set caminho = substring(url from '/storage/v1/object/public/arquivos/(.*)$')
where caminho is null and url is not null;

-- 2. Bucket vira privado
update storage.buckets set public = false where id = 'arquivos';

-- 3. RLS de leitura pro Portal do Cliente: cliente só pode gerar link
--    assinado pra arquivos que pertencem à própria empresa (join com a
--    tabela "arquivos", que já tem RLS de leitura escopada por cliente_id
--    desde a migration 026).
drop policy if exists "arquivos_storage_select_portal" on storage.objects;
create policy "arquivos_storage_select_portal" on storage.objects for select
  using (
    bucket_id = 'arquivos'
    and auth_role() = 'cliente'
    and exists (
      select 1 from public.arquivos a
      where a.caminho = storage.objects.name and a.cliente_id = auth_cliente_id()
    )
  );

-- (as policies "arquivos_storage_select"/"_write" pro time interno, criadas
-- na migration 025, continuam valendo sem alteração)

-- ============================================================
-- Fim da migration 030
-- ============================================================
