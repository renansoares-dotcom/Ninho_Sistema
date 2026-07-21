-- ============================================================
-- Ninho Consultoria — Migration 021: Plano de Trabalho
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table plano_acoes add column if not exists responsavel_nome text;

-- ============================================================
-- Fim da migration 021
-- ============================================================
