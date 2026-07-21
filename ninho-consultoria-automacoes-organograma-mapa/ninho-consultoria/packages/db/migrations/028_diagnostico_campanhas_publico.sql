-- ============================================================
-- Ninho Consultoria — Migration 028: Campanhas de acompanhamento +
-- Diagnóstico público (lead magnet)
-- Rodar no SQL Editor do Supabase (depois de 025, 026 e 027)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Campanhas de diagnóstico de acompanhamento (cliente já existente)
-- ------------------------------------------------------------
create table if not exists diagnostico_campanhas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  titulo text not null,
  ativa boolean default false,
  criada_por uuid references profiles(id),
  created_at timestamptz default now(),
  encerrada_em timestamptz
);

-- Libera reenvio: presença de uma linha aqui mais recente que o último
-- diagnóstico do cliente pra essa campanha = ele pode responder de novo.
create table if not exists diagnostico_campanha_liberacoes (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid references diagnostico_campanhas(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  liberado_por uuid references profiles(id),
  liberado_em timestamptz default now()
);

-- Marca quais diagnósticos vieram de autopreenchimento do cliente numa
-- campanha (nulo = diagnóstico feito pelo consultor, como sempre foi).
alter table diagnosticos add column if not exists campanha_id uuid references diagnostico_campanhas(id) on delete set null;

alter table diagnostico_campanhas enable row level security;
alter table diagnostico_campanha_liberacoes enable row level security;

-- Equipe interna: lê tudo, só gestão (admin/diretor) cria/edita/encerra campanha
create policy "diagnostico_campanhas_select" on diagnostico_campanhas for select
  using (tenant_id = auth_tenant_id() and (auth_is_interno() or (auth_role() = 'cliente' and ativa)));
create policy "diagnostico_campanhas_write" on diagnostico_campanhas for all
  using (tenant_id = auth_tenant_id() and auth_is_gestao())
  with check (tenant_id = auth_tenant_id() and auth_is_gestao());

create policy "diagnostico_campanha_liberacoes_select" on diagnostico_campanha_liberacoes for select
  using (exists (
    select 1 from diagnostico_campanhas c
    where c.id = campanha_id and c.tenant_id = auth_tenant_id()
      and (auth_is_interno() or (auth_role() = 'cliente' and cliente_id = auth_cliente_id()))
  ));
create policy "diagnostico_campanha_liberacoes_write" on diagnostico_campanha_liberacoes for insert
  with check (exists (
    select 1 from diagnostico_campanhas c where c.id = campanha_id and c.tenant_id = auth_tenant_id() and auth_is_gestao()
  ));

-- Cliente já pode SELECT em "diagnosticos"/"diagnostico_areas" (migration 026).
-- Falta permitir que ele mesmo crie um diagnóstico de acompanhamento,
-- só enquanto existir campanha ativa pro tenant dele.
create policy "diagnosticos_insert_portal" on diagnosticos for insert
  with check (
    auth_role() = 'cliente'
    and cliente_id = auth_cliente_id()
    and tenant_id = auth_tenant_id()
    and campanha_id in (select id from diagnostico_campanhas where ativa and tenant_id = auth_tenant_id())
  );

create policy "diagnostico_areas_insert_portal" on diagnostico_areas for insert
  with check (exists (
    select 1 from diagnosticos d
    where d.id = diagnostico_id and d.cliente_id = auth_cliente_id() and auth_role() = 'cliente'
  ));

-- ------------------------------------------------------------
-- 2. Banco de perguntas do Diagnóstico Público (editável pela gestão)
-- ------------------------------------------------------------
create table if not exists diagnostico_publico_perguntas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  texto text not null,
  peso numeric not null default 1,
  ordem int default 0,
  ativa boolean default true,
  created_at timestamptz default now()
);

alter table diagnostico_publico_perguntas enable row level security;
create policy "diagnostico_publico_perguntas_select" on diagnostico_publico_perguntas for select
  using (tenant_id = auth_tenant_id() and auth_is_interno());
create policy "diagnostico_publico_perguntas_write" on diagnostico_publico_perguntas for all
  using (tenant_id = auth_tenant_id() and auth_is_gestao())
  with check (tenant_id = auth_tenant_id() and auth_is_gestao());

-- Sem policy de leitura pública aqui de propósito: o formulário público não
-- consulta o banco direto — passa por uma rota de servidor dedicada
-- (app/api/diagnostico-publico), que usa a service role key. Isso evita
-- abrir qualquer policy de RLS pra tráfego anônimo da internet.

-- Seed: 7 perguntas padrão, pesos somando 10 (edite à vontade depois pelo app)
insert into diagnostico_publico_perguntas (tenant_id, texto, peso, ordem)
select
  t.id,
  p.texto,
  p.peso,
  p.ordem
from tenants t
cross join (values
  ('A empresa tem controle de fluxo de caixa atualizado?', 2, 1),
  ('Existe separação entre finanças pessoais e da empresa?', 1, 2),
  ('Há metas comerciais claras e acompanhadas?', 1, 3),
  ('A empresa tem processos documentados (não depende só de uma pessoa)?', 2, 4),
  ('Existe planejamento tributário ativo?', 1, 5),
  ('A equipe tem indicadores de desempenho definidos?', 1, 6),
  ('Existe um plano estratégico para os próximos 12 meses?', 2, 7)
) as p(texto, peso, ordem)
where not exists (select 1 from diagnostico_publico_perguntas where tenant_id = t.id);

-- ------------------------------------------------------------
-- 3. Diagnósticos públicos recebidos (fila de espera até um consultor
--    revisar e decidir importar como Cliente/Lead)
-- ------------------------------------------------------------
create table if not exists diagnosticos_publicos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  email text not null,
  celular text,
  respostas jsonb not null default '[]',
  nota numeric not null,
  status text not null default 'Novo' check (status in ('Novo', 'Importado', 'Descartado')),
  cliente_id uuid references clientes(id) on delete set null,
  importado_por uuid references profiles(id),
  importado_em timestamptz,
  created_at timestamptz default now()
);

alter table diagnosticos_publicos enable row level security;
create policy "diagnosticos_publicos_select" on diagnosticos_publicos for select
  using (tenant_id = auth_tenant_id() and auth_is_interno());
create policy "diagnosticos_publicos_write" on diagnosticos_publicos for update
  using (tenant_id = auth_tenant_id() and auth_is_interno())
  with check (tenant_id = auth_tenant_id() and auth_is_interno());

-- Sem policy de INSERT aqui também de propósito: quem grava é a rota de
-- servidor (service role), nunca o navegador do visitante anônimo direto.

-- ============================================================
-- Fim da migration 028
-- ============================================================
