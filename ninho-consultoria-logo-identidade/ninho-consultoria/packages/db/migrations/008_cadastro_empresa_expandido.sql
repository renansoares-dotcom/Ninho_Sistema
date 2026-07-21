-- ============================================================
-- Ninho Consultoria — Migration 008: Cadastro de empresa expandido
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table clientes add column if not exists inscricao_estadual text;
alter table clientes add column if not exists inscricao_municipal text;
alter table clientes add column if not exists cnae_principal text;
alter table clientes add column if not exists natureza_juridica text;
alter table clientes add column if not exists regime_tributario text;
alter table clientes add column if not exists capital_social numeric;
alter table clientes add column if not exists erp_utilizado text;
alter table clientes add column if not exists banco_principal text;
alter table clientes add column if not exists site text;
alter table clientes add column if not exists instagram text;
alter table clientes add column if not exists linkedin text;
alter table clientes add column if not exists tags text[] default '{}';

-- ============================================================
-- Fim da migration 008
-- ============================================================
