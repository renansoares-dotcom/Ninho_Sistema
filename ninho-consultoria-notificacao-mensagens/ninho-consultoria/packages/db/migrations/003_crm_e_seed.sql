-- ============================================================
-- Ninho Consultoria — Migration 003: CRM (oportunidades) + seed
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- Como ainda não implementamos login (Supabase Auth), ainda não existem
-- registros em "profiles" para vincular como responsável de verdade (FK).
-- Adicionamos um campo de texto temporário só para exibição, que será
-- substituído por responsavel_id (FK) quando o login estiver pronto.
alter table leads_oportunidades add column if not exists responsavel_nome text;
alter table oportunidade_atividades add column if not exists tipo_display text;

-- ------------------------------------------------------------
-- SEED — oportunidades de exemplo (mesmas do mock do frontend)
-- ------------------------------------------------------------
insert into leads_oportunidades (tenant_id, empresa_nome, responsavel_nome, telefone, email, origem, etapa, valor_estimado, probabilidade, observacoes) values
  ('00000000-0000-0000-0000-000000000001', 'Studio Criativo Nix', 'MC', null, null, null, 'lead', 18000, 20, null),
  ('00000000-0000-0000-0000-000000000001', 'Vale Verde Comércio', 'RS', null, null, null, 'lead', 9500, 15, null),
  ('00000000-0000-0000-0000-000000000001', 'Trigo Dourado Padaria', 'JP', null, null, null, 'contato', 12000, 30, null),
  ('00000000-0000-0000-0000-000000000001', 'Ferro Sul Metalúrgica', 'MC', null, null, null, 'reuniao', 64000, 45, null),
  ('00000000-0000-0000-0000-000000000001', 'Grupo Alvorada', 'BA', null, null, null, 'diagnostico', 38000, 55, null),
  ('00000000-0000-0000-0000-000000000001', 'Nova Era Logística', 'RS', null, null, null, 'diagnostico', 27500, 50, null),
  ('00000000-0000-0000-0000-000000000001', 'Doce Sabor Alimentos', 'JP', null, null, null, 'proposta', 21000, 65, null),
  (
    '00000000-0000-0000-0000-000000000001', 'Construtora Horizonte', 'MC',
    '(81) 99222-3344', 'contato@construtorahorizonte.com.br', 'Indicação de cliente',
    'negociacao', 92000, 75,
    'Empresa em fase de expansão para dois novos estados, buscando estruturar governança antes do crescimento.'
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'TechFlow Sistemas', 'BA',
    '(11) 98888-1234', 'bruna@techflow.com.br', 'Site — formulário de contato',
    'contrato', 45000, 90,
    'Startup em crescimento acelerado, precisa de estrutura financeira antes da próxima rodada de investimento.'
  ),
  ('00000000-0000-0000-0000-000000000001', 'Metalúrgica Ferro Sul', 'MC', null, null, null, 'cliente_ativo', 64000, 100, null);

-- Atividades de exemplo para as duas oportunidades mais avançadas
insert into oportunidade_atividades (oportunidade_id, tipo, descricao, data)
select id, 'Ligação', 'Primeiro contato, levantamento de dores', '2026-07-08'
from leads_oportunidades where empresa_nome = 'Construtora Horizonte';

insert into oportunidade_atividades (oportunidade_id, tipo, descricao, data)
select id, 'Reunião', 'Apresentação institucional da Ninho', '2026-07-12'
from leads_oportunidades where empresa_nome = 'Construtora Horizonte';

insert into oportunidade_atividades (oportunidade_id, tipo, descricao, data)
select id, 'Proposta', 'Envio da proposta comercial', '2026-07-15'
from leads_oportunidades where empresa_nome = 'Construtora Horizonte';

insert into oportunidade_atividades (oportunidade_id, tipo, descricao, data)
select id, 'Reunião', 'Diagnóstico preliminar realizado', '2026-07-01'
from leads_oportunidades where empresa_nome = 'TechFlow Sistemas';

insert into oportunidade_atividades (oportunidade_id, tipo, descricao, data)
select id, 'Contrato', 'Contrato enviado para assinatura', '2026-07-09'
from leads_oportunidades where empresa_nome = 'TechFlow Sistemas';

-- ============================================================
-- Fim da migration 003
-- ============================================================
