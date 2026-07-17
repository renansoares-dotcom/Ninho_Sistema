-- ============================================================
-- Ninho Consultoria — Migration 007: Financeiro + seed
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- ------------------------------------------------------------
-- Contrato 1 — Metalúrgica Ferro Sul (em dia)
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 64000, 6, '2026-05-25', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%ferro sul%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 10666.67, '2026-06-25', 'Pago', '2026-06-24' from novo_contrato
union all
select id, 2, 10666.67, '2026-07-25', 'Pendente', null from novo_contrato;

-- ------------------------------------------------------------
-- Contrato 2 — TechFlow Sistemas (em dia)
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 45000, 4, '2026-06-28', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%techflow%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 11250, '2026-07-28', 'Pendente', null from novo_contrato;

-- ------------------------------------------------------------
-- Contrato 3 — Grupo Alvorada (em dia)
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 38000, 8, '2026-06-30', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%alvorada%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 4750, '2026-06-30', 'Pago', '2026-06-29' from novo_contrato
union all
select id, 2, 4750, '2026-07-30', 'Pendente', null from novo_contrato;

-- ------------------------------------------------------------
-- Contrato 4 — Vale Verde Comércio (inadimplente)
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 9500, 3, '2026-05-12', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%vale verde%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 3166.67, '2026-06-12', 'Pago', '2026-06-11' from novo_contrato
union all
select id, 2, 3166.67, '2026-07-12', 'Atrasado', null from novo_contrato;

-- ------------------------------------------------------------
-- Contrato 5 — Padaria Trigo Dourado (em dia)
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 12000, 4, '2026-06-22', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%trigo dourado%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 3000, '2026-07-22', 'Pendente', null from novo_contrato;

-- ============================================================
-- Fim da migration 007
-- ============================================================
