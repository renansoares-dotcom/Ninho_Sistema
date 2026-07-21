-- ============================================================
-- Ninho Consultoria — Migration 011: Diagnóstico analítico
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table diagnosticos add column if not exists riscos jsonb default '[]';

-- ============================================================
-- Fim da migration 011
-- ============================================================
