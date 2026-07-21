-- ============================================================
-- Ninho Consultoria — Migration 018: E-mail de NFe do cliente
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table clientes add column if not exists email_nfe text;

-- ============================================================
-- Fim da migration 018
-- ============================================================
