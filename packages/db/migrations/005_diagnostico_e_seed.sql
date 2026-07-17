-- ============================================================
-- Ninho Consultoria — Migration 005: Diagnóstico + seed
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- ------------------------------------------------------------
-- Diagnóstico 1 — Grupo Alvorada (concluído)
-- ------------------------------------------------------------
with novo_diag as (
  insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria)
  select
    '00000000-0000-0000-0000-000000000001', c.id, '2026-07-10', 'Concluído', 7.2,
    'O Grupo Alvorada apresenta maturidade acima da média em Comercial e Gestão, mas precisa estruturar Marketing e Estoque para sustentar o crescimento projetado nos próximos 12 meses.',
    '["Área Comercial estruturada e com metas claras", "Gestão com boa governança"]'::jsonb,
    '["Marketing sem plano formalizado", "Estoque sem ponto de reposição definido"]'::jsonb
  from clientes c where c.nome_fantasia ilike '%alvorada%'
  returning id
)
insert into diagnostico_areas (diagnostico_id, area, nota)
select id, area, nota from novo_diag,
  (values ('Financeiro',7.5),('RH',6.0),('Marketing',5.5),('Comercial',8.0),('Produção',6.8),('Fiscal',7.0),('Compras',6.2),('Estoque',5.9),('Gestão',7.8)) as a(area, nota);

-- ------------------------------------------------------------
-- Diagnóstico 2 — Metalúrgica Ferro Sul (concluído)
-- ------------------------------------------------------------
with novo_diag as (
  insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria)
  select
    '00000000-0000-0000-0000-000000000001', c.id, '2026-07-05', 'Concluído', 6.4,
    'A Metalúrgica Ferro Sul tem base operacional sólida, com oportunidade de ganho rápido ao formalizar RH e o processo de compras.',
    '["Processos produtivos documentados", "Controle fiscal em dia"]'::jsonb,
    '["RH sem avaliação de desempenho", "Compras sem cotação estruturada"]'::jsonb
  from clientes c where c.nome_fantasia ilike '%ferro sul%'
  returning id
)
insert into diagnostico_areas (diagnostico_id, area, nota)
select id, area, nota from novo_diag,
  (values ('Financeiro',6.8),('RH',4.5),('Marketing',5.0),('Comercial',6.5),('Produção',7.9),('Fiscal',7.6),('Compras',5.2),('Estoque',6.0),('Gestão',7.1)) as a(area, nota);

-- ------------------------------------------------------------
-- Diagnóstico 3 — Nova Era Logística (em andamento, sem áreas ainda)
-- ------------------------------------------------------------
insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral)
select '00000000-0000-0000-0000-000000000001', c.id, '2026-07-14', 'Em andamento', 5.8
from clientes c where c.nome_fantasia ilike '%nova era%';

-- ------------------------------------------------------------
-- Diagnóstico 4 — TechFlow Sistemas (recém-iniciado)
-- ------------------------------------------------------------
insert into diagnosticos (tenant_id, cliente_id, data, status)
select '00000000-0000-0000-0000-000000000001', c.id, '2026-07-16', 'Em preenchimento'
from clientes c where c.nome_fantasia ilike '%techflow%';

-- ============================================================
-- Fim da migration 005
-- ============================================================
