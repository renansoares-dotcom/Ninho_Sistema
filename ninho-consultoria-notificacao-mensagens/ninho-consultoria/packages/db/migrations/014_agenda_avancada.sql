-- ============================================================
-- Ninho Consultoria — Migration 014: Agenda avançada
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table eventos add column if not exists local text;
alter table eventos add column if not exists participantes text[] default '{}';
alter table eventos add column if not exists recorrencia_grupo_id uuid;

-- ============================================================
-- Fim da migration 014
-- ============================================================
