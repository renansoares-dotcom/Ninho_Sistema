-- ============================================================
-- Ninho Consultoria — Migration 004: Kanban (tarefas) + seed
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- Mesmo caso do CRM: sem login ainda, então sem "profiles" para vincular
-- responsável de verdade. Campo texto temporário para exibição.
alter table tarefas add column if not exists responsavel_nome text;

-- ------------------------------------------------------------
-- SEED — tarefas de exemplo, vinculadas aos clientes reais já cadastrados
-- ------------------------------------------------------------
insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Levantar dados financeiros', 'afazer', 'Alta', '2026-07-22', 'BA'
from clientes c where c.nome_fantasia ilike '%alvorada%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Montar apresentação do diagnóstico', 'afazer', 'Média', '2026-07-25', 'MC'
from clientes c where c.nome_fantasia ilike '%ferro sul%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Reunião de alinhamento de plano', 'andamento', 'Alta', '2026-07-19', 'RS'
from clientes c where c.nome_fantasia ilike '%nova era%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Ajustar precificação de produtos', 'andamento', 'Média', '2026-07-21', 'JP'
from clientes c where c.nome_fantasia ilike '%trigo dourado%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Estruturar centro de custos', 'andamento', 'Alta', '2026-07-20', 'BA'
from clientes c where c.nome_fantasia ilike '%techflow%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Revisar fluxo de caixa projetado', 'revisao', 'Média', '2026-07-18', 'JP'
from clientes c where c.nome_fantasia ilike '%doce sabor%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Plano de ação — RH', 'concluido', 'Baixa', '2026-07-15', 'MC'
from clientes c where c.nome_fantasia ilike '%alvorada%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Diagnóstico fiscal inicial', 'concluido', 'Alta', '2026-07-12', 'RS'
from clientes c where c.nome_fantasia ilike '%ferro sul%';

-- ============================================================
-- Fim da migration 004
-- ============================================================
