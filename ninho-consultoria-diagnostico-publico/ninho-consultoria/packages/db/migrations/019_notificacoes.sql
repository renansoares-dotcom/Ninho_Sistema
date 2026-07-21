-- ============================================================
-- Ninho Consultoria — Migration 019: Notificações reais
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- A tabela "notificacoes" (criada na migration 001) ainda não tinha tenant_id,
-- porque dependia de "profile_id" (que só existe de verdade após o login).
-- Adicionamos tenant_id para já funcionar antes do Auth existir.
alter table notificacoes add column if not exists tenant_id uuid references tenants(id) on delete cascade;

-- ------------------------------------------------------------
-- SEED — notificações de exemplo
-- ------------------------------------------------------------
insert into notificacoes (tenant_id, tipo, titulo, lida, link) values
  ('00000000-0000-0000-0000-000000000001', 'financeiro', 'Parcela da Vale Verde Comércio está atrasada', false, '/financeiro'),
  ('00000000-0000-0000-0000-000000000001', 'diagnostico', 'Diagnóstico da TechFlow Sistemas ainda em preenchimento', false, '/diagnostico'),
  ('00000000-0000-0000-0000-000000000001', 'agenda', 'Você tem uma reunião hoje às 10h', false, '/agenda'),
  ('00000000-0000-0000-0000-000000000001', 'crm', 'Oportunidade Construtora Horizonte está há 9 dias na mesma etapa', true, '/crm');

-- ============================================================
-- Fim da migration 019
-- ============================================================
