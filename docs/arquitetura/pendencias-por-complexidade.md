# Ninho Consultoria — O que falta (por complexidade)

## ✅ Concluído

**Login real (Supabase Auth) + RLS por perfil** — sessão via cookies, middleware protegendo rotas, menu contextual por perfil, "esqueci minha senha", gestão de usuários. Guia: `docs/arquitetura/guia-login-auth.md`.

**Portal do Cliente** — Meu Painel, Plano de Trabalho, Indicadores, Arquivos e Mensagens, com RLS escopado por `cliente_id`. Guia: `docs/arquitetura/guia-portal-cliente.md`.

**Diagnóstico Público + Campanhas de Acompanhamento** — link público de captação de leads com quiz de pesos editáveis, resultado teaser na hora, fila de revisão em Diagnóstico → Recebidos, campanhas sazonais pro diagnóstico de acompanhamento no Portal. Guia: `docs/arquitetura/guia-diagnostico-publico-e-campanhas.md`.

**Identidade Visual** — logo por tenant, aplicada em todo canto (sistema, Portal, Diagnóstico Público, telas de Login).

**Automações reais** — os 5 gatilhos de `/automacoes` funcionam de verdade, com Vercel Cron rodando as checagens periódicas 1x/dia.

**Organograma visual + Mapa com busca automática de endereço.** Guia: `docs/arquitetura/guia-automacoes-organograma-mapa.md`.

**Upload real de anexos no Kanban** — já existia (não era um link manual como constava aqui antes).

**Bucket de Arquivos privado** — antes era público (qualquer um com o link acessava, mesmo sem login); agora gera link temporário a cada abertura.

**Notificação de mensagem nos dois sentidos** — antes só cliente→equipe avisava; agora equipe→cliente também, e o Portal ganhou sino próprio.

**Notificações por e-mail** — mensagens (nos dois sentidos) e novo diagnóstico público recebido disparam e-mail, via Resend. Guia: `docs/arquitetura/guia-arquivos-privados-notificacoes-email.md`.

## 🟢 Baixa complexidade (ainda pendente)

1. **Cadastro de cliente — e-mail para NFe** — campo específico pra onde a nota fiscal deve ser enviada (separado do e-mail de contato geral)
2. **Editar diagnóstico existente** — hoje só dá pra criar e excluir, não editar um diagnóstico já feito
3. **Módulo de Visitas (Registro de Consultorias)** — a tabela `visitas` já existe no banco mas nunca ganhou tela própria (CRUD: data, objetivo, relato, decisões, pendências, próxima visita)

## 🟡 Média complexidade

4. **Módulo de Faturamento completo** — emissão simulada de NFS-e usando dados do cliente + da empresa, listagem de notas emitidas, status, geração de PDF da nota
5. **Relatórios em PDF de verdade** — hoje `/relatorios` é uma lista de exemplo; implementar geração real (diagnóstico, plano de trabalho, relatório de visita)
6. **Captcha visual no Diagnóstico Público** — hoje só tem honeypot + limite de reenvio por e-mail, suficiente contra bot simples mas não contra spam mais sofisticado

## 🔴 Alta complexidade

7. **IA consultora** — integração com OpenAI: resumir reuniões, gerar sugestões, responder perguntas sobre o histórico do cliente
8. **Editor de texto rico nos cards do Kanban** — hoje a descrição é texto simples; um editor tipo Notion é bem mais trabalho
9. **Multi-tenant de verdade** — hoje existe um único tenant fixo; as políticas de RLS já são escritas por `tenant_id`, então deve ser mais sobre lógica de qual tenant escolher do que reescrever segurança

---

**Minha recomendação**: os itens 🟢 são rápidos. O item 7 (IA consultora) é o que eu acho que mais aumenta o valor percebido pelo cliente final do escritório.

---

## Atualização — Editor de texto rico no Kanban

Concluído. A descrição das tarefas do Kanban (`components/shared/TarefaFormModal.tsx`) agora usa um editor de texto rico (Tiptap) — negrito, itálico, tachado, título, lista, lista numerada, checklist, citação, código e link. Sem migration necessária: o campo `descricao` já era texto livre no banco, só passou a guardar HTML em vez de texto puro. Descrições antigas continuam abrindo normalmente.
