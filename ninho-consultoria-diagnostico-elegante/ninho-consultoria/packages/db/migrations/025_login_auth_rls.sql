-- ============================================================
-- Ninho Consultoria — Migration 025: Login/Auth real + RLS por perfil
-- Rodar no SQL Editor do Supabase (Project > SQL Editor > New query)
--
-- O que essa migration faz:
--   1. Prepara "profiles" para autenticação real (coluna cliente_id, pra
--      quando o Portal do Cliente existir).
--   2. Cria um gatilho que provisiona automaticamente uma linha em
--      "profiles" sempre que alguém é criado no Supabase Auth (convite
--      pelo painel, por exemplo) — sem isso, o login funciona mas o app
--      não sabe o nome/perfil da pessoa.
--   3. Substitui TODAS as policies "temp_allow_all_*" (liberação total,
--      criadas antes do login existir) por policies reais, baseadas em
--      auth.uid() + perfil (role) + tenant_id.
--
-- Importante: isso pressupõe que você já tem pelo menos um usuário criado
-- no Supabase Auth (Authentication > Users > Add user) ANTES de rodar essa
-- migration — assim que ele existir, o gatilho da seção 2 cria o profile
-- correspondente automaticamente. Veja docs/arquitetura/guia-login-auth.md
-- para o passo a passo completo.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Coluna para vincular um profile "cliente" a um registro em "clientes"
--    (usada pelo futuro Portal do Cliente; hoje fica só disponível).
-- ------------------------------------------------------------
alter table public.profiles add column if not exists cliente_id uuid references public.clientes(id) on delete set null;

-- ------------------------------------------------------------
-- 2. Provisionamento automático de profile ao criar usuário no Auth
-- ------------------------------------------------------------
-- Usa o metadata do usuário (raw_user_meta_data->>'nome') se enviado na
-- criação/convite; senão usa a parte antes do @ do e-mail como nome inicial.
-- tenant_id: como ainda não existe multi-tenant de verdade, todo profile
-- novo entra automaticamente no primeiro (único) tenant cadastrado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  select id into v_tenant_id from public.tenants order by created_at asc limit 1;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 3. Funções auxiliares usadas pelas policies (RLS)
-- ------------------------------------------------------------
-- security definer: pra poder ler "profiles" de dentro de uma policy de
-- OUTRA tabela sem cair em recursão de RLS.
create or replace function public.auth_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_tenant_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_is_ativo()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(ativo, false) from public.profiles where id = auth.uid();
$$;

-- Time interno = todo perfil que não é "cliente". É esse grupo que acessa a
-- área (app); "cliente" é isolado para o futuro Portal.
create or replace function public.auth_is_interno()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.auth_role() is not null and public.auth_role() <> 'cliente' and public.auth_is_ativo();
$$;

create or replace function public.auth_is_gestao()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.auth_role() in ('admin', 'diretor') and public.auth_is_ativo();
$$;

create or replace function public.auth_is_financeiro()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.auth_role() in ('admin', 'diretor', 'financeiro') and public.auth_is_ativo();
$$;

-- ------------------------------------------------------------
-- 4. Trigger de proteção em "profiles": ninguém edita o próprio
--    role/ativo/tenant_id a não ser Admin/Diretor (evita auto-promoção).
-- ------------------------------------------------------------
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.auth_is_gestao() then
    if new.role is distinct from old.role
       or new.ativo is distinct from old.ativo
       or new.tenant_id is distinct from old.tenant_id then
      raise exception 'Você não tem permissão para alterar perfil, status ou tenant da própria conta.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileges on public.profiles;
create trigger trg_protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- ------------------------------------------------------------
-- 5. Remove TODAS as policies temporárias (liberação total)
-- ------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where policyname like 'temp_allow_all_%'
  loop
    execute format('drop policy if exists %I on %I.%I;', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 6. TENANTS — cada usuário só enxerga o próprio tenant
-- ------------------------------------------------------------
create policy "tenants_select" on public.tenants for select
  using (id = public.auth_tenant_id());

-- ------------------------------------------------------------
-- 7. PROFILES
-- ------------------------------------------------------------
create policy "profiles_select" on public.profiles for select
  using (
    tenant_id = public.auth_tenant_id()
    and (public.auth_role() <> 'cliente' or id = auth.uid())
  );

create policy "profiles_update" on public.profiles for update
  using (tenant_id = public.auth_tenant_id() and (id = auth.uid() or public.auth_is_gestao()))
  with check (tenant_id = public.auth_tenant_id() and (id = auth.uid() or public.auth_is_gestao()));

-- Sem policy de INSERT/DELETE para profiles a partir do cliente: a criação
-- acontece só pelo gatilho (security definer) e a exclusão fica reservada
-- pra ser feita direto no painel do Supabase por enquanto.

-- ------------------------------------------------------------
-- 8. Tabelas operacionais com tenant_id direto — tiers padrão
-- ------------------------------------------------------------
-- Tier "interno": select/insert/update/delete para qualquer perfil
-- interno (não-cliente) do próprio tenant.
-- Tier "financeiro": além do interno, exige role admin/diretor/financeiro
-- para escrita (select continua liberado pro time inteiro, só a escrita é
-- restrita — assim consultor/coordenador ainda enxergam status de contrato
-- do próprio cliente sem poder editar valores).
-- Tier "gestao": leitura e escrita restritas a admin/diretor.

-- clientes / leads_oportunidades / eventos / projetos / tarefas /
-- diagnosticos / planos_trabalho / visitas / arquivos / dashboard_preferencias
-- Uma única policy "for all" já cobre select+insert+update+delete — não
-- precisa de uma policy de select separada com a mesma condição.
create policy "clientes_all" on public.clientes for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "leads_oportunidades_all" on public.leads_oportunidades for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "eventos_all" on public.eventos for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "projetos_all" on public.projetos for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "tarefas_all" on public.tarefas for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "diagnosticos_all" on public.diagnosticos for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "planos_trabalho_all" on public.planos_trabalho for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "visitas_all" on public.visitas for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "arquivos_all" on public.arquivos for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

create policy "dashboard_preferencias_all" on public.dashboard_preferencias for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

-- notificacoes — cada pessoa só vê/edita (marca como lida) as próprias
create policy "notificacoes_select" on public.notificacoes for select
  using (tenant_id = public.auth_tenant_id() and public.auth_is_interno() and profile_id = auth.uid());
create policy "notificacoes_write" on public.notificacoes for update
  using (tenant_id = public.auth_tenant_id() and profile_id = auth.uid())
  with check (tenant_id = public.auth_tenant_id() and profile_id = auth.uid());
create policy "notificacoes_insert" on public.notificacoes for insert
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_interno());

-- automacoes_regras — só gestão
create policy "automacoes_regras_select" on public.automacoes_regras for select using (tenant_id = public.auth_tenant_id() and public.auth_is_interno());
create policy "automacoes_regras_write" on public.automacoes_regras for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_gestao())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_gestao());

-- configuracoes_empresa — só gestão
create policy "configuracoes_empresa_select" on public.configuracoes_empresa for select using (tenant_id = public.auth_tenant_id() and public.auth_is_interno());
create policy "configuracoes_empresa_write" on public.configuracoes_empresa for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_gestao())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_gestao());

-- financeiro: contratos, despesas, notas_fiscais — leitura pro time interno,
-- escrita restrita a admin/diretor/financeiro
create policy "contratos_select" on public.contratos for select using (tenant_id = public.auth_tenant_id() and public.auth_is_interno());
create policy "contratos_write" on public.contratos for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro());

create policy "despesas_select" on public.despesas for select using (tenant_id = public.auth_tenant_id() and public.auth_is_interno());
create policy "despesas_write" on public.despesas for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro());

create policy "notas_fiscais_select" on public.notas_fiscais for select using (tenant_id = public.auth_tenant_id() and public.auth_is_interno());
create policy "notas_fiscais_write" on public.notas_fiscais for all
  using (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro())
  with check (tenant_id = public.auth_tenant_id() and public.auth_is_financeiro());

-- ------------------------------------------------------------
-- 9. Tabelas "filhas" (sem tenant_id próprio — herdam do pai)
-- ------------------------------------------------------------
create policy "clientes_contatos_all" on public.clientes_contatos for all
  using (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "clientes_organograma_all" on public.clientes_organograma for all
  using (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "oportunidade_atividades_all" on public.oportunidade_atividades for all
  using (exists (select 1 from public.leads_oportunidades o where o.id = oportunidade_id and o.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.leads_oportunidades o where o.id = oportunidade_id and o.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "diagnostico_areas_all" on public.diagnostico_areas for all
  using (exists (select 1 from public.diagnosticos d where d.id = diagnostico_id and d.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.diagnosticos d where d.id = diagnostico_id and d.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "plano_acoes_all" on public.plano_acoes for all
  using (exists (select 1 from public.planos_trabalho pt where pt.id = plano_id and pt.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.planos_trabalho pt where pt.id = plano_id and pt.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "tarefa_checklist_items_all" on public.tarefa_checklist_items for all
  using (exists (select 1 from public.tarefas t where t.id = tarefa_id and t.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.tarefas t where t.id = tarefa_id and t.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "tarefa_anexos_all" on public.tarefa_anexos for all
  using (exists (select 1 from public.tarefas t where t.id = tarefa_id and t.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.tarefas t where t.id = tarefa_id and t.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "kpi_definicoes_all" on public.kpi_definicoes for all
  using (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()))
  with check (exists (select 1 from public.clientes c where c.id = cliente_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));

create policy "kpi_valores_all" on public.kpi_valores for all
  using (exists (
    select 1 from public.kpi_definicoes kd
    join public.clientes c on c.id = kd.cliente_id
    where kd.id = kpi_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()
  ))
  with check (exists (
    select 1 from public.kpi_definicoes kd
    join public.clientes c on c.id = kd.cliente_id
    where kd.id = kpi_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()
  ));

create policy "contrato_parcelas_select" on public.contrato_parcelas for select
  using (exists (select 1 from public.contratos c where c.id = contrato_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_interno()));
create policy "contrato_parcelas_write" on public.contrato_parcelas for all
  using (exists (select 1 from public.contratos c where c.id = contrato_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_financeiro()))
  with check (exists (select 1 from public.contratos c where c.id = contrato_id and c.tenant_id = public.auth_tenant_id() and public.auth_is_financeiro()));

-- comentarios — tabela genérica (entidade_tipo/entidade_id), sem tenant_id
-- próprio. Como hoje existe um único tenant, liberamos para qualquer
-- perfil interno autenticado; quando o multi-tenant de verdade existir,
-- essa tabela precisa ganhar uma coluna tenant_id própria.
create policy "comentarios_all" on public.comentarios for all
  using (public.auth_is_interno())
  with check (public.auth_is_interno());

-- ------------------------------------------------------------
-- 10. Storage — bucket "arquivos"
-- ------------------------------------------------------------
drop policy if exists "arquivos_storage_select" on storage.objects;
drop policy if exists "arquivos_storage_write" on storage.objects;

create policy "arquivos_storage_select" on storage.objects for select
  using (bucket_id = 'arquivos' and public.auth_is_interno());
create policy "arquivos_storage_write" on storage.objects for all
  using (bucket_id = 'arquivos' and public.auth_is_interno())
  with check (bucket_id = 'arquivos' and public.auth_is_interno());

-- ============================================================
-- Fim da migration 025
-- ============================================================
