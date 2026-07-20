-- ============================================================
-- Ninho Consultoria — Migration 023: Automações reais
-- Rodar no SQL Editor do Supabase
-- ============================================================

insert into automacoes_regras (tenant_id, nome, gatilho, ativa) values
  ('00000000-0000-0000-0000-000000000001', 'Gerar tarefa de revisão após diagnóstico concluído', 'diagnostico_concluido', true),
  ('00000000-0000-0000-0000-000000000001', 'Lembrete de parcela a vencer (3 dias antes)', 'parcela_vencendo', true),
  ('00000000-0000-0000-0000-000000000001', 'Alertar sobre tarefas atrasadas', 'tarefa_atrasada', true),
  ('00000000-0000-0000-0000-000000000001', 'Notificar cliente sobre nova atividade', 'nova_atividade_cliente', false),
  ('00000000-0000-0000-0000-000000000001', 'Avisar sobre contrato próximo do vencimento', 'contrato_vencendo', false);

-- ============================================================
-- Fim da migration 023
-- ============================================================
