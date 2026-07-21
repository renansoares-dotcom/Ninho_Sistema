# Ninho Consultoria — O que falta (por complexidade)

## 🟢 Baixa complexidade (segue padrão já usado, rápido de entregar)

1. **Cadastro de cliente — e-mail para NFe** — campo específico pra onde a nota fiscal deve ser enviada (separado do e-mail de contato geral)
2. **Notificações reais** — o sininho do menu superior hoje é só visual (uma bolinha vermelha fixa); conectar à tabela `notificacoes` que já existe no banco
3. **Editar diagnóstico existente** — hoje só dá pra criar e excluir, não editar um diagnóstico já feito
4. **Upload real de anexos no Kanban** — hoje os anexos de tarefa são links manuais; dá pra trocar por upload de verdade, reaproveitando o bucket do Storage que já criamos pra Arquivos
5. **Módulo de Visitas (Registro de Consultorias)** — a tabela `visitas` já existe no banco (da Fase 1) mas nunca ganhou tela; CRUD simples: data, objetivo, relato, decisões, pendências, próxima visita

## 🟡 Média complexidade

6. **Módulo de Faturamento completo** (o que já começamos) — emissão simulada de NFS-e usando dados do cliente + da empresa, listagem de notas emitidas, status (emitida/cancelada), geração de PDF da nota
7. **Módulo de Plano de Trabalho** — tabelas `planos_trabalho`/`plano_acoes` já existem; falta a tela — um gerenciador de ações que nasce a partir de um diagnóstico concluído, com responsável/prazo/status por ação
8. **Módulo de KPIs** — tabelas já existem; comparativo "antes x depois" por cliente, com gráfico de evolução
9. **Relatórios em PDF de verdade** — hoje `/relatorios` é só uma lista de exemplo; implementar geração real de PDF (diagnóstico, plano de trabalho, relatório de visita)
10. **Automações reais** — hoje os toggles de `/automacoes` não disparam nada; implementar um motor simples que executa as regras (ex: gerar tarefas quando diagnóstico é concluído)
11. **Organograma e mapa de localização** — os dois itens que deixei de fora na Etapa B do cadastro de cliente, por exigirem mais infraestrutura

## ✅ Concluído

**Login real (Supabase Auth) + RLS por perfil** — feito. Sessão via cookies (`@supabase/ssr`), middleware protegendo rotas, menu contextual por perfil, "esqueci minha senha", gestão de usuários em Configurações, e políticas de RLS reais (substituindo o "allow all" temporário) nas 29 tabelas do banco. Guia de ativação em `docs/arquitetura/guia-login-auth.md`.

## ✅ Concluído (adicional)

**Diagnóstico Público + Campanhas de Acompanhamento** — link público de captação de leads (`/diagnostico-publico`, com quiz de pesos editáveis somando 10, resultado teaser na hora, fila de revisão em Diagnóstico → Recebidos) + campanhas sazonais controladas pelo escritório pra clientes já ativos preencherem o diagnóstico de 9 áreas pelo Portal (uma vez por campanha, com liberação manual de reenvio pelo admin). Guia completo em `docs/arquitetura/guia-diagnostico-publico-e-campanhas.md` — inclui um passo extra de configuração (Service Role Key) que não existia antes.

## 🔴 Alta complexidade (o que resta)

13. ~~Portal do Cliente~~ — **concluído.** Meu Painel, Plano de Trabalho, Indicadores, Arquivos e Mensagens (chat com a equipe), tudo com RLS escopado por `cliente_id`. Guia de ativação em `docs/arquitetura/guia-portal-cliente.md`. Pendência conhecida: o bucket de Arquivos ainda é público no Storage (ver guia).
14. **IA consultora (a antiga F4)** — integração com OpenAI: resumir reuniões, gerar sugestões, responder perguntas sobre o histórico do cliente
15. **Editor de texto rico nos cards do Kanban** — hoje a descrição é um campo de texto simples; um editor tipo Notion (formatação, blocos) é bem mais complexo de implementar
16. **Multi-tenant de verdade** — hoje existe um único "tenant" fixo (todo usuário novo é vinculado a ele automaticamente); as políticas de RLS já são escritas por `tenant_id`, então suportar múltiplas consultorias deve ser mais sobre lógica de qual tenant escolher do que reescrever segurança

---

**Minha recomendação**: os itens 🟢 e 🟡 restantes (Automações reais, Organograma/mapa) continuam sendo os mais rápidos de fechar. Depois deles, a IA consultora é o próximo salto de valor percebido pelo cliente final.
