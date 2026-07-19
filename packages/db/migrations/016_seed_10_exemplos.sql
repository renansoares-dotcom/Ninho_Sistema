-- ============================================================
-- Ninho Consultoria — Migration 016: Seed complementar (10 exemplos por módulo)
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- ------------------------------------------------------------
-- CLIENTES — completando de 8 para 10
-- ------------------------------------------------------------
insert into clientes (tenant_id, razao_social, nome_fantasia, segmento, status, faturamento, num_funcionarios, porte, endereco) values
  ('00000000-0000-0000-0000-000000000001', 'Distribuidora Boa Vista Ltda.', 'Distribuidora Boa Vista', 'Varejo', 'Ativo', 2100000, 40, 'Médio porte', '{"cidade":"Olinda","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Clínica Vitalis Saúde Ltda.', 'Clínica Vitalis', 'Saúde', 'Prospect', 1500000, 25, 'Pequeno porte', '{"cidade":"Recife","uf":"PE"}');

-- ------------------------------------------------------------
-- CLIENTES_CONTATOS — 1 contato principal por cliente (10 no total)
-- ------------------------------------------------------------
insert into clientes_contatos (cliente_id, nome, cargo, telefone, email, principal)
select id, 'Marcelo Andrade', 'Diretor Industrial', '(81) 99123-4567', 'marcelo@ferrosul.com.br', true from clientes where nome_fantasia ilike '%ferro sul%'
union all
select id, 'Bruna Alencar', 'CEO', '(11) 98888-1234', 'bruna@techflow.com.br', true from clientes where nome_fantasia ilike '%techflow%'
union all
select id, 'José Ricardo Lima', 'Proprietário', '(81) 99321-1111', 'jose@trigodourado.com.br', true from clientes where nome_fantasia ilike '%trigo dourado%'
union all
select id, 'Camila Torres', 'Diretora Financeira', '(81) 99222-3344', 'camila@horizonte.com.br', true from clientes where nome_fantasia ilike '%horizonte%'
union all
select id, 'Paulo Mendes', 'Sócio-Administrador', '(81) 99456-7788', 'paulo@docesabor.com.br', true from clientes where nome_fantasia ilike '%doce sabor%'
union all
select id, 'Renata Souza', 'Gerente de Operações', '(81) 99654-3210', 'renata@novaeralogistica.com.br', true from clientes where nome_fantasia ilike '%nova era%'
union all
select id, 'Bruno Alves', 'Diretor Comercial', '(81) 99888-2233', 'bruno@grupoalvorada.com.br', true from clientes where nome_fantasia ilike '%alvorada%'
union all
select id, 'Simone Cardoso', 'Proprietária', '(87) 99111-4455', 'simone@valeverde.com.br', true from clientes where nome_fantasia ilike '%vale verde%'
union all
select id, 'Diego Farias', 'Gerente Comercial', '(81) 99777-6655', 'diego@boavista.com.br', true from clientes where nome_fantasia ilike '%boa vista%'
union all
select id, 'Dra. Patrícia Nunes', 'Diretora Clínica', '(81) 99666-5544', 'patricia@clinicavitalis.com.br', true from clientes where nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- TAREFAS — completando de 8 para 10
-- ------------------------------------------------------------
insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Mapear processo de compras', 'afazer', 'Média', '2026-08-01', 'JP'
from clientes c where c.nome_fantasia ilike '%boa vista%';

insert into tarefas (tenant_id, cliente_id, titulo, coluna, prioridade, data_conclusao, responsavel_nome)
select '00000000-0000-0000-0000-000000000001', c.id, 'Levantamento inicial — diagnóstico', 'andamento', 'Alta', '2026-07-30', 'BA'
from clientes c where c.nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- DIAGNÓSTICOS — completando de 4 para 10
-- ------------------------------------------------------------
with novo_diag as (
  insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria)
  select '00000000-0000-0000-0000-000000000001', c.id, '2026-06-28', 'Concluído', 6.9,
    'A Padaria Trigo Dourado tem boa relação com clientes locais, mas precisa profissionalizar a precificação e o controle de estoque.',
    '["Atendimento e relacionamento com clientes"]'::jsonb, '["Precificação sem critério definido"]'::jsonb
  from clientes c where c.nome_fantasia ilike '%trigo dourado%'
  returning id
)
insert into diagnostico_areas (diagnostico_id, area, nota)
select id, area, nota from novo_diag,
  (values ('Financeiro',6.0),('RH',5.5),('Marketing',6.2),('Comercial',7.5),('Produção',7.0),('Fiscal',6.8),('Compras',6.0),('Estoque',5.0),('Gestão',7.2)) as a(area, nota);

with novo_diag as (
  insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria)
  select '00000000-0000-0000-0000-000000000001', c.id, '2026-06-20', 'Concluído', 7.6,
    'A Construtora Horizonte está em fase de expansão e precisa estruturar governança antes de crescer para novos estados.',
    '["Carteira de projetos consistente", "Bom relacionamento bancário"]'::jsonb, '["Governança familiar pouco formalizada"]'::jsonb
  from clientes c where c.nome_fantasia ilike '%horizonte%'
  returning id
)
insert into diagnostico_areas (diagnostico_id, area, nota)
select id, area, nota from novo_diag,
  (values ('Financeiro',8.0),('RH',6.5),('Marketing',6.8),('Comercial',8.2),('Produção',7.9),('Fiscal',7.5),('Compras',7.0),('Estoque',7.0),('Gestão',6.5)) as a(area, nota);

with novo_diag as (
  insert into diagnosticos (tenant_id, cliente_id, data, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria)
  select '00000000-0000-0000-0000-000000000001', c.id, '2026-06-15', 'Concluído', 6.1,
    'A Doce Sabor Alimentos tem produto forte, mas margem apertada por falta de controle de custos de produção.',
    '["Produto com boa aceitação de mercado"]'::jsonb, '["Custos de produção não mapeados"]'::jsonb
  from clientes c where c.nome_fantasia ilike '%doce sabor%'
  returning id
)
insert into diagnostico_areas (diagnostico_id, area, nota)
select id, area, nota from novo_diag,
  (values ('Financeiro',5.0),('RH',5.8),('Marketing',6.5),('Comercial',6.9),('Produção',6.0),('Fiscal',6.5),('Compras',5.5),('Estoque',5.2),('Gestão',6.8)) as a(area, nota);

insert into diagnosticos (tenant_id, cliente_id, data, status)
select '00000000-0000-0000-0000-000000000001', c.id, '2026-07-05', 'Em preenchimento'
from clientes c where c.nome_fantasia ilike '%vale verde%';

insert into diagnosticos (tenant_id, cliente_id, data, status)
select '00000000-0000-0000-0000-000000000001', c.id, '2026-07-15', 'Em andamento'
from clientes c where c.nome_fantasia ilike '%boa vista%';

insert into diagnosticos (tenant_id, cliente_id, data, status)
select '00000000-0000-0000-0000-000000000001', c.id, '2026-07-18', 'Em preenchimento'
from clientes c where c.nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- EVENTOS — completando de 8 para 10
-- ------------------------------------------------------------
insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome, local)
select '00000000-0000-0000-0000-000000000001', 'Reunião de abertura — Distribuidora Boa Vista', 'reuniao', c.id, '2026-07-22 09:30:00', 'JP', 'Sede do cliente — Olinda/PE'
from clientes c where c.nome_fantasia ilike '%boa vista%';

insert into eventos (tenant_id, titulo, tipo, cliente_id, data_inicio, responsavel_nome, local)
select '00000000-0000-0000-0000-000000000001', 'Diagnóstico preliminar — Clínica Vitalis', 'videoconferencia', c.id, '2026-07-23 14:00:00', 'BA', 'Google Meet'
from clientes c where c.nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- CONTRATOS — completando de 5 para 10
-- ------------------------------------------------------------
with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 28000, 4, '2026-06-20', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%horizonte%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 7000, '2026-07-20'::date, 'Pendente', null from novo_contrato;

with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 18000, 3, '2026-06-15', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%doce sabor%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 6000, '2026-06-15'::date, 'Pago', '2026-06-14'::date from novo_contrato
union all
select id, 2, 6000, '2026-07-15'::date, 'Pendente', null from novo_contrato;

with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 22000, 4, '2026-07-01', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%nova era%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 5500, '2026-08-01'::date, 'Pendente', null from novo_contrato;

with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 15000, 3, '2026-07-10', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%boa vista%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 5000, '2026-08-10'::date, 'Pendente', null from novo_contrato;

with novo_contrato as (
  insert into contratos (tenant_id, cliente_id, valor_total, num_parcelas, data_inicio, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 12000, 2, '2026-07-18', 'Ativo'
  from clientes c where c.nome_fantasia ilike '%vitalis%'
  returning id
)
insert into contrato_parcelas (contrato_id, numero, valor, vencimento, status, data_pagamento)
select id, 1, 6000, '2026-08-18'::date, 'Pendente', null from novo_contrato;

-- ------------------------------------------------------------
-- ARQUIVOS — 10 exemplos (metadados; sem arquivo real anexado, apenas para teste de listagem)
-- ------------------------------------------------------------
insert into arquivos (tenant_id, nome, url, categoria, cliente_id, favorito, tipo_arquivo)
select '00000000-0000-0000-0000-000000000001'::uuid, 'Contrato assinado.pdf', 'https://example.com/placeholder.pdf', 'Contrato', c.id, true, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%ferro sul%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Relatório de diagnóstico.pdf', 'https://example.com/placeholder.pdf', 'Diagnóstico', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%ferro sul%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Ata de reunião.pdf', 'https://example.com/placeholder.pdf', 'Geral', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%techflow%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Foto da visita técnica.jpg', 'https://example.com/placeholder.jpg', 'Visita', c.id, false, 'image/jpeg'
from clientes c where c.nome_fantasia ilike '%trigo dourado%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Planilha financeira.xlsx', 'https://example.com/placeholder.xlsx', 'Financeiro', c.id, true, 'application/vnd.ms-excel'
from clientes c where c.nome_fantasia ilike '%horizonte%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Relatório executivo.pdf', 'https://example.com/placeholder.pdf', 'Relatório', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%doce sabor%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Proposta comercial.pdf', 'https://example.com/placeholder.pdf', 'Geral', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%nova era%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Plano de trabalho.pdf', 'https://example.com/placeholder.pdf', 'Diagnóstico', c.id, true, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%alvorada%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Contrato — Vale Verde.pdf', 'https://example.com/placeholder.pdf', 'Contrato', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%vale verde%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, 'Apresentação institucional.pdf', 'https://example.com/placeholder.pdf', 'Geral', c.id, false, 'application/pdf'
from clientes c where c.nome_fantasia ilike '%boa vista%';

-- ============================================================
-- Fim da migration 016
-- ============================================================
