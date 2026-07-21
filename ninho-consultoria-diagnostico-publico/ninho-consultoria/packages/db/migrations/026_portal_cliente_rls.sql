-- ============================================================
-- Ninho Consultoria — Migration 026: Portal do Cliente (RLS)
-- Rodar no SQL Editor do Supabase (Project > SQL Editor > New query)
--
-- Dá ao perfil "cliente" acesso de LEITURA, escopado só aos próprios dados
-- (via profiles.cliente_id), às tabelas que alimentam o Portal:
-- Meu Painel, Plano de Trabalho, Indicadores, Arquivos e Mensagens.
--
-- Por design, o portal NÃO expõe: Kanban interno (tarefas — pode conter
-- anotações internas da equipe), Financeiro/Contratos, Visitas. Isso segue
-- a diretriz de design original ("Cliente no Portal vê um menu reduzido").
-- ============================================================

-- ------------------------------------------------------------
-- 1. Função auxiliar: cliente_id vinculado ao usuário logado
-- ------------------------------------------------------------
create or replace function public.auth_cliente_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select cliente_id from public.profiles where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 2. Clientes — o cliente enxerga só o próprio registro
-- ------------------------------------------------------------
create policy "clientes_select_portal" on public.clientes for select
  using (public.auth_role() = 'cliente' and id = public.auth_cliente_id());

-- ------------------------------------------------------------
-- 3. Diagnóstico
-- ------------------------------------------------------------
create policy "diagnosticos_select_portal" on public.diagnosticos for select
  using (public.auth_role() = 'cliente' and cliente_id = public.auth_cliente_id());

create policy "diagnostico_areas_select_portal" on public.diagnostico_areas for select
  using (exists (
    select 1 from public.diagnosticos d
    where d.id = diagnostico_id and public.auth_role() = 'cliente' and d.cliente_id = public.auth_cliente_id()
  ));

-- ------------------------------------------------------------
-- 4. Plano de Trabalho
-- ------------------------------------------------------------
create policy "planos_trabalho_select_portal" on public.planos_trabalho for select
  using (public.auth_role() = 'cliente' and cliente_id = public.auth_cliente_id());

create policy "plano_acoes_select_portal" on public.plano_acoes for select
  using (exists (
    select 1 from public.planos_trabalho pt
    where pt.id = plano_id and public.auth_role() = 'cliente' and pt.cliente_id = public.auth_cliente_id()
  ));

-- ------------------------------------------------------------
-- 5. Indicadores (KPIs)
-- ------------------------------------------------------------
create policy "kpi_definicoes_select_portal" on public.kpi_definicoes for select
  using (public.auth_role() = 'cliente' and cliente_id = public.auth_cliente_id());

create policy "kpi_valores_select_portal" on public.kpi_valores for select
  using (exists (
    select 1 from public.kpi_definicoes kd
    where kd.id = kpi_id and public.auth_role() = 'cliente' and kd.cliente_id = public.auth_cliente_id()
  ));

-- ------------------------------------------------------------
-- 6. Arquivos
-- ------------------------------------------------------------
create policy "arquivos_select_portal" on public.arquivos for select
  using (public.auth_role() = 'cliente' and cliente_id = public.auth_cliente_id());

-- ------------------------------------------------------------
-- 7. Agenda — só pra mostrar "próxima reunião" no Meu Painel
-- ------------------------------------------------------------
create policy "eventos_select_portal" on public.eventos for select
  using (public.auth_role() = 'cliente' and cliente_id = public.auth_cliente_id());

-- ------------------------------------------------------------
-- 8. Mensagens — reaproveita a tabela genérica "comentarios", usando a
--    convenção entidade_tipo = 'cliente_mensagem' / entidade_id = cliente_id.
--    O time interno já enxerga tudo via a policy "comentarios_all" (migration
--    025); aqui só liberamos o lado do cliente.
-- ------------------------------------------------------------
create policy "comentarios_select_portal" on public.comentarios for select
  using (public.auth_role() = 'cliente' and entidade_tipo = 'cliente_mensagem' and entidade_id = public.auth_cliente_id());

create policy "comentarios_insert_portal" on public.comentarios for insert
  with check (public.auth_role() = 'cliente' and entidade_tipo = 'cliente_mensagem' and entidade_id = public.auth_cliente_id() and autor_id = auth.uid());

-- ============================================================
-- Fim da migration 026
-- ============================================================
