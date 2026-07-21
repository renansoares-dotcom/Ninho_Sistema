-- ============================================================
-- Ninho Consultoria — Migration 006: Agenda + seed
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table eventos add column if not exists responsavel_nome text;

-- ------------------------------------------------------------
-- SEED — eventos de exemplo
-- ------------------------------------------------------------
insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Reunião de diagnóstico — Nova Era Logística', 'reuniao', c.id, '2026-07-17 10:00:00', 'RS'
from clientes c where c.nome_fantasia ilike '%nova era%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Visita técnica — Padaria Trigo Dourado', 'visita_tecnica', c.id, '2026-07-17 14:30:00', 'JP'
from clientes c where c.nome_fantasia ilike '%trigo dourado%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Apresentação do plano de trabalho — Grupo Alvorada', 'videoconferencia', c.id, '2026-07-18 09:00:00', 'BA'
from clientes c where c.nome_fantasia ilike '%alvorada%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Alinhamento comercial — Construtora Horizonte', 'reuniao', c.id, '2026-07-18 16:00:00', 'MC'
from clientes c where c.nome_fantasia ilike '%horizonte%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Visita técnica — Metalúrgica Ferro Sul', 'visita_tecnica', c.id, '2026-07-20 08:30:00', 'MC'
from clientes c where c.nome_fantasia ilike '%ferro sul%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
values ('00000000-0000-0000-0000-000000000001', 'Follow-up comercial — Studio Criativo Nix', 'videoconferencia', null, '2026-07-21 11:00:00', 'MC');

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Reunião de fechamento — Doce Sabor Alimentos', 'reuniao', c.id, '2026-07-24 10:30:00', 'JP'
from clientes c where c.nome_fantasia ilike '%doce sabor%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', 'Visita técnica — TechFlow Sistemas', 'visita_tecnica', c.id, '2026-07-28 15:00:00', 'BA'
from clientes c where c.nome_fantasia ilike '%techflow%';

-- ============================================================
-- Fim da migration 006
-- ============================================================
