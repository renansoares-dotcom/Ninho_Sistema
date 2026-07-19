-- ============================================================
-- Ninho Consultoria — Migration 010: CRM avançado (Workspace de Relacionamento)
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table leads_oportunidades add column if not exists score int default 50 check (score >= 0 and score <= 100);
alter table leads_oportunidades add column if not exists temperatura text default 'Morno';
alter table leads_oportunidades add column if not exists perdida boolean default false;
alter table leads_oportunidades add column if not exists motivo_perda text;

-- ============================================================
-- Fim da migration 010
-- ============================================================
