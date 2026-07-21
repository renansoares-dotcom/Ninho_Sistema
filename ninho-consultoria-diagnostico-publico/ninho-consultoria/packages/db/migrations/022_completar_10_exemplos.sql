-- ============================================================
-- Ninho Consultoria — Migration 022: Completar 10 exemplos em tudo
-- Rodar no SQL Editor do Supabase
-- Só ADICIONA dados novos — nada é apagado ou alterado.
-- ============================================================

-- ------------------------------------------------------------
-- NOTIFICAÇÕES — já tinha 4, completando para 10
-- ------------------------------------------------------------
insert into notificacoes (tenant_id, tipo, titulo, lida, link) values
  ('00000000-0000-0000-0000-000000000001', 'kanban', 'Tarefa "Estruturar centro de custos" está em andamento', true, '/kanban'),
  ('00000000-0000-0000-0000-000000000001', 'financeiro', 'Nova parcela paga pela Doce Sabor Alimentos', true, '/financeiro'),
  ('00000000-0000-0000-0000-000000000001', 'visitas', 'Visita registrada na Distribuidora Boa Vista', false, '/visitas'),
  ('00000000-0000-0000-0000-000000000001', 'diagnostico', 'Diagnóstico da Clínica Vitalis em preenchimento', false, '/diagnostico'),
  ('00000000-0000-0000-0000-000000000001', 'crm', 'Studio Criativo Nix parado há 6 dias na etapa Lead', false, '/crm'),
  ('00000000-0000-0000-0000-000000000001', 'agenda', 'Reunião com a Clínica Vitalis amanhã às 14h', false, '/agenda');

-- ------------------------------------------------------------
-- VISITAS — 0 → 10
-- ------------------------------------------------------------
insert into visitas (tenant_id, cliente_id, data, hora, objetivo, relato, decisoes, pendencias)
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-01'::date, '09:00'::time, 'Levantamento inicial de processos', 'Reunião com a diretoria para mapear os principais gargalos operacionais.', 'Priorizar financeiro e RH nas próximas semanas.', 'Enviar planilha de custos até sexta.'
from clientes c where c.nome_fantasia ilike '%ferro sul%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-03'::date, '10:30'::time, 'Acompanhamento de indicadores', 'Revisão dos KPIs comerciais junto ao time de vendas.', 'Ajustar meta mensal para o próximo trimestre.', null
from clientes c where c.nome_fantasia ilike '%techflow%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-05'::date, '14:00'::time, 'Diagnóstico de precificação', 'Análise da planilha de custos de produção da padaria.', 'Reajustar preço de 3 produtos-chave.', 'Cliente precisa enviar notas fiscais dos últimos 3 meses.'
from clientes c where c.nome_fantasia ilike '%trigo dourado%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-08'::date, '09:30'::time, 'Governança familiar', 'Discussão sobre estrutura de sócios antes da expansão.', 'Formalizar acordo de sócios com advogado externo.', null
from clientes c where c.nome_fantasia ilike '%horizonte%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-10'::date, '11:00'::time, 'Revisão de custos de produção', 'Mapeamento dos custos por lote de produção.', 'Implementar planilha de custo por produto.', 'Aguardando dados do fornecedor principal.'
from clientes c where c.nome_fantasia ilike '%doce sabor%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-11'::date, '15:00'::time, 'Alinhamento logístico', 'Reunião sobre otimização de rotas de entrega.', 'Testar novo roteirizador nas próximas duas semanas.', null
from clientes c where c.nome_fantasia ilike '%nova era%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-12'::date, '08:30'::time, 'Follow-up do plano de trabalho', 'Revisão das ações pendentes do plano de RH.', 'Contratar auxiliar administrativo até agosto.', 'Falta aprovação orçamentária da diretoria.'
from clientes c where c.nome_fantasia ilike '%alvorada%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-06-20'::date, '10:00'::time, 'Diagnóstico financeiro inicial', 'Levantamento de inadimplência e fluxo de caixa.', 'Renegociar prazos com fornecedores.', null
from clientes c where c.nome_fantasia ilike '%vale verde%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-15'::date, '09:00'::time, 'Reunião de abertura de contrato', 'Apresentação da equipe e cronograma inicial.', 'Iniciar diagnóstico completo na próxima semana.', null
from clientes c where c.nome_fantasia ilike '%boa vista%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, '2026-07-16'::date, '14:30'::time, 'Diagnóstico preliminar', 'Primeira visita para entender a operação da clínica.', 'Agendar diagnóstico completo.', 'Cliente vai enviar relação de convênios atendidos.'
from clientes c where c.nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- PLANOS DE TRABALHO — 0 → 10 (com 2 ações cada, total 20)
-- ------------------------------------------------------------
with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%ferro sul%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Formalizar avaliação de desempenho', 'MC', 'Alta', '2026-08-10'::date, 'Em andamento' from novo_plano
union all
select id, 'Estruturar processo de cotação de fornecedores', 'RS', 'Média', '2026-08-20'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%techflow%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Implementar CRM para gestão comercial', 'BA', 'Alta', '2026-08-05'::date, 'Concluído' from novo_plano
union all
select id, 'Definir metas trimestrais de vendas', 'BA', 'Média', '2026-08-15'::date, 'Em andamento' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%trigo dourado%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Reajustar precificação de produtos-chave', 'JP', 'Alta', '2026-07-30'::date, 'Concluído' from novo_plano
union all
select id, 'Implementar controle de estoque simplificado', 'JP', 'Média', '2026-08-25'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%horizonte%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Formalizar acordo de sócios', 'MC', 'Alta', '2026-09-01'::date, 'Pendente' from novo_plano
union all
select id, 'Estruturar comitê de governança', 'MC', 'Média', '2026-09-15'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%doce sabor%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Mapear custo por produto', 'JP', 'Alta', '2026-08-08'::date, 'Em andamento' from novo_plano
union all
select id, 'Renegociar contratos de fornecimento', 'JP', 'Baixa', '2026-09-05'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%nova era%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Testar novo sistema de roteirização', 'RS', 'Alta', '2026-08-12'::date, 'Em andamento' from novo_plano
union all
select id, 'Treinar equipe de motoristas', 'RS', 'Média', '2026-08-28'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%alvorada%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Contratar auxiliar administrativo', 'BA', 'Média', '2026-08-30'::date, 'Pendente' from novo_plano
union all
select id, 'Revisar plano de cargos e salários', 'MC', 'Baixa', '2026-09-10'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%vale verde%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Renegociar prazos com fornecedores', 'RS', 'Alta', '2026-07-28'::date, 'Concluído' from novo_plano
union all
select id, 'Regularizar parcelas em atraso', 'RS', 'Alta', '2026-08-05'::date, 'Em andamento' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%boa vista%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Concluir diagnóstico completo', 'JP', 'Alta', '2026-08-01'::date, 'Pendente' from novo_plano
union all
select id, 'Mapear processo de compras', 'JP', 'Média', '2026-08-18'::date, 'Pendente' from novo_plano;

with novo_plano as (
  insert into planos_trabalho (tenant_id, cliente_id, status)
  select '00000000-0000-0000-0000-000000000001', c.id, 'Ativo' from clientes c where c.nome_fantasia ilike '%vitalis%'
  returning id
)
insert into plano_acoes (plano_id, titulo, responsavel_nome, prioridade, prazo, status)
select id, 'Levantar relação de convênios', 'BA', 'Média', '2026-08-02'::date, 'Pendente' from novo_plano
union all
select id, 'Estruturar agenda de atendimentos', 'BA', 'Alta', '2026-08-10'::date, 'Pendente' from novo_plano;

-- ------------------------------------------------------------
-- KPIs — 0 → 10 definições, cada uma com baseline (+leitura atual quando aplicável)
-- ------------------------------------------------------------
with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Faturamento mensal', 'R$' from clientes c where c.nome_fantasia ilike '%ferro sul%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 320000, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 361000, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Ticket médio', 'R$' from clientes c where c.nome_fantasia ilike '%techflow%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 4200, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 5100, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Margem líquida', '%' from clientes c where c.nome_fantasia ilike '%trigo dourado%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 8, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 12.5, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Prazo médio de obra', 'dias' from clientes c where c.nome_fantasia ilike '%horizonte%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 180, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 165, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Custo de produção por lote', 'R$' from clientes c where c.nome_fantasia ilike '%doce sabor%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 950, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 820, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Custo médio por entrega', 'R$' from clientes c where c.nome_fantasia ilike '%nova era%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 38, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 31, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Rotatividade de equipe', '%' from clientes c where c.nome_fantasia ilike '%alvorada%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 22, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 14, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Inadimplência de clientes', '%' from clientes c where c.nome_fantasia ilike '%vale verde%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-05-01'::date, 18, 'baseline' from novo_kpi
union all
select id, '2026-07-01'::date, 9, 'atual' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Giro de estoque', 'vezes/mês' from clientes c where c.nome_fantasia ilike '%boa vista%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-06-01'::date, 2.1, 'baseline' from novo_kpi;

with novo_kpi as (
  insert into kpi_definicoes (cliente_id, nome, unidade)
  select c.id, 'Taxa de ocupação da agenda', '%' from clientes c where c.nome_fantasia ilike '%vitalis%'
  returning id
)
insert into kpi_valores (kpi_id, data_referencia, valor, tipo)
select id, '2026-06-01'::date, 55, 'baseline' from novo_kpi;

-- ------------------------------------------------------------
-- NOTAS FISCAIS — 0 → 10 (simuladas)
-- ------------------------------------------------------------
insert into notas_fiscais (tenant_id, cliente_id, numero, serie, valor, descricao_servico, codigo_servico, aliquota_iss, data_emissao, status, ambiente, chave_acesso)
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 1, '1', 10666.67, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-06-25'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%ferro sul%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 2, '1', 11250, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-07-28'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%techflow%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 3, '1', 3000, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-06-22'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%trigo dourado%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 4, '1', 7000, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-07-20'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%horizonte%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 5, '1', 6000, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-06-15'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%doce sabor%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 6, '1', 5500, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-08-01'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%nova era%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 7, '1', 4750, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-06-30'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%alvorada%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 8, '1', 3166.67, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-06-12'::date, 'Cancelada', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%vale verde%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 9, '1', 5000, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-07-10'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%boa vista%'
union all
select '00000000-0000-0000-0000-000000000001'::uuid, c.id, 10, '1', 6000, 'Consultoria empresarial — parcela 1', '17.01', 3, '2026-07-18'::date, 'Emitida', 'Homologação',
  (select string_agg((floor(random()*10))::text, '') from generate_series(1,44))
from clientes c where c.nome_fantasia ilike '%vitalis%';

-- ------------------------------------------------------------
-- CHECKLIST, ANEXOS E COMENTÁRIOS DE TAREFAS (Kanban) — 0 → 10 cada
-- ------------------------------------------------------------
insert into tarefa_checklist_items (tarefa_id, titulo, concluido, ordem)
select id, 'Levantar extratos bancários', true, 0 from tarefas where titulo = 'Levantar dados financeiros'
union all
select id, 'Organizar planilha de custos', false, 1 from tarefas where titulo = 'Levantar dados financeiros'
union all
select id, 'Selecionar slides do diagnóstico', true, 0 from tarefas where titulo = 'Montar apresentação do diagnóstico'
union all
select id, 'Revisar dados com o consultor sênior', false, 1 from tarefas where titulo = 'Montar apresentação do diagnóstico'
union all
select id, 'Confirmar pauta da reunião', true, 0 from tarefas where titulo = 'Reunião de alinhamento de plano'
union all
select id, 'Enviar convite aos participantes', true, 1 from tarefas where titulo = 'Reunião de alinhamento de plano'
union all
select id, 'Levantar preços da concorrência', true, 0 from tarefas where titulo = 'Ajustar precificação de produtos'
union all
select id, 'Definir nova tabela de preços', false, 1 from tarefas where titulo = 'Ajustar precificação de produtos'
union all
select id, 'Mapear centros de custo existentes', true, 0 from tarefas where titulo = 'Estruturar centro de custos'
union all
select id, 'Validar estrutura com financeiro', false, 1 from tarefas where titulo = 'Estruturar centro de custos';

insert into comentarios (entidade_tipo, entidade_id, autor_nome, texto)
select 'tarefa', id, 'Consultor', 'Já iniciei o levantamento, deve ficar pronto até quinta.' from tarefas where titulo = 'Levantar dados financeiros'
union all
select 'tarefa', id, 'Consultor', 'Cliente confirmou envio dos extratos.' from tarefas where titulo = 'Levantar dados financeiros'
union all
select 'tarefa', id, 'Consultor', 'Rascunho inicial pronto para revisão.' from tarefas where titulo = 'Montar apresentação do diagnóstico'
union all
select 'tarefa', id, 'Consultor', 'Reunião confirmada para segunda-feira.' from tarefas where titulo = 'Reunião de alinhamento de plano'
union all
select 'tarefa', id, 'Consultor', 'Aguardando aprovação da nova tabela.' from tarefas where titulo = 'Ajustar precificação de produtos'
union all
select 'tarefa', id, 'Consultor', 'Precisamos validar com o financeiro antes de fechar.' from tarefas where titulo = 'Estruturar centro de custos'
union all
select 'tarefa', id, 'Consultor', 'Plano de ação de RH já foi comunicado à equipe.' from tarefas where titulo = 'Plano de ação — RH'
union all
select 'tarefa', id, 'Consultor', 'Diagnóstico fiscal concluído sem pendências.' from tarefas where titulo = 'Diagnóstico fiscal inicial'
union all
select 'tarefa', id, 'Consultor', 'Vou revisar o fluxo de caixa amanhã.' from tarefas where titulo = 'Revisar fluxo de caixa projetado'
union all
select 'tarefa', id, 'Consultor', 'Reunião de abertura foi muito produtiva.' from tarefas where titulo = 'Mapear processo de compras';

insert into tarefa_anexos (tarefa_id, nome, url)
select id, 'Extrato bancário — junho.pdf', 'https://example.com/placeholder.pdf' from tarefas where titulo = 'Levantar dados financeiros'
union all
select id, 'Planilha de custos.xlsx', 'https://example.com/placeholder.xlsx' from tarefas where titulo = 'Levantar dados financeiros'
union all
select id, 'Apresentação — rascunho.pptx', 'https://example.com/placeholder.pptx' from tarefas where titulo = 'Montar apresentação do diagnóstico'
union all
select id, 'Pauta da reunião.pdf', 'https://example.com/placeholder.pdf' from tarefas where titulo = 'Reunião de alinhamento de plano'
union all
select id, 'Pesquisa de preços — concorrentes.xlsx', 'https://example.com/placeholder.xlsx' from tarefas where titulo = 'Ajustar precificação de produtos'
union all
select id, 'Nova tabela de preços.xlsx', 'https://example.com/placeholder.xlsx' from tarefas where titulo = 'Ajustar precificação de produtos'
union all
select id, 'Estrutura de centro de custos.pdf', 'https://example.com/placeholder.pdf' from tarefas where titulo = 'Estruturar centro de custos'
union all
select id, 'Plano de ação RH.pdf', 'https://example.com/placeholder.pdf' from tarefas where titulo = 'Plano de ação — RH'
union all
select id, 'Diagnóstico fiscal.pdf', 'https://example.com/placeholder.pdf' from tarefas where titulo = 'Diagnóstico fiscal inicial'
union all
select id, 'Fluxo de caixa projetado.xlsx', 'https://example.com/placeholder.xlsx' from tarefas where titulo = 'Revisar fluxo de caixa projetado';

-- ============================================================
-- Fim da migration 022
-- ============================================================
