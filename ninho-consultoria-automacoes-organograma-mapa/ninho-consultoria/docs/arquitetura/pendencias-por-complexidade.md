# Ninho Consultoria — O que falta (por complexidade)

## ✅ Concluído

**Login real (Supabase Auth) + RLS por perfil** — sessão via cookies (`@supabase/ssr`), middleware protegendo rotas, menu contextual por perfil, "esqueci minha senha", gestão de usuários em Configurações, RLS real (não mais "allow all") nas tabelas do banco. Guia: `docs/arquitetura/guia-login-auth.md`.

**Portal do Cliente** — Meu Painel, Plano de Trabalho, Indicadores, Arquivos e Mensagens (chat com a equipe), com RLS escopado por `cliente_id`. Guia: `docs/arquitetura/guia-portal-cliente.md`.

**Notificações reais** — sino conectado à tabela `notificacoes` de verdade (não é mais só visual), com gatilho automático quando o cliente manda mensagem pelo Portal.

**Diagnóstico Público + Campanhas de Acompanhamento** — link público de captação de leads (`/diagnostico-publico`, quiz com pesos editáveis somando 10, resultado teaser na hora, fila de revisão em Diagnóstico → Recebidos) + campanhas sazonais pra clientes já ativos preencherem o diagnóstico completo pelo Portal. Guia: `docs/arquitetura/guia-diagnostico-publico-e-campanhas.md`.

**Identidade Visual (logo por tenant)** — upload de logo em Configurações, aplicado no sistema principal, Portal, Diagnóstico Público e telas de Login. Guia: seção 8 de `guia-diagnostico-publico-e-campanhas.md`.

**Automações reais** — os 5 gatilhos de `/automacoes` têm lógica de verdade, com destinatário certo e um Vercel Cron rodando as checagens periódicas uma vez por dia sem depender de ninguém abrir o Dashboard.

**Organograma visual** — gráfico de caixas conectadas por linhas, no lugar da lista com recuo.

**Mapa com busca automática** — busca de coordenadas pelo endereço (OpenStreetMap/Nominatim, gratuito), sem precisar saber latitude/longitude de cabeça.

Guia dos três últimos: `docs/arquitetura/guia-automacoes-organograma-mapa.md`.

## 🟢 Baixa complexidade (ainda pendente)

1. **Cadastro de cliente — e-mail para NFe** — campo específico pra onde a nota fiscal deve ser enviada (separado do e-mail de contato geral)
2. **Editar diagnóstico existente** — hoje só dá pra criar e excluir, não editar um diagnóstico já feito
3. **Upload real de anexos no Kanban** — hoje os anexos de tarefa são links manuais; dá pra trocar por upload de verdade, reaproveitando o bucket do Storage
4. **Módulo de Visitas (Registro de Consultorias)** — a tabela `visitas` já existe no banco mas nunca ganhou tela própria (CRUD: data, objetivo, relato, decisões, pendências, próxima visita)
5. **Bucket de Arquivos ainda é público no Storage** — criado assim antes do login existir; o ideal é trocar por links assinados (signed URLs)
6. **Notificação de mensagem só funciona num sentido** — cliente → equipe funciona; equipe → cliente não avisa ninguém (Portal não tem sino próprio ainda)
7. **Notificações por e-mail** — hoje é só dentro do app

## 🟡 Média complexidade

8. **Módulo de Faturamento completo** — emissão simulada de NFS-e usando dados do cliente + da empresa, listagem de notas emitidas, status, geração de PDF da nota
9. **Relatórios em PDF de verdade** — hoje `/relatorios` é uma lista de exemplo; implementar geração real (diagnóstico, plano de trabalho, relatório de visita)
10. **Captcha visual no Diagnóstico Público** — hoje só tem honeypot + limite de reenvio por e-mail, suficiente contra bot simples mas não contra spam mais sofisticado

## 🔴 Alta complexidade

11. **IA consultora** — integração com OpenAI: resumir reuniões, gerar sugestões, responder perguntas sobre o histórico do cliente
12. **Editor de texto rico nos cards do Kanban** — hoje a descrição é texto simples; um editor tipo Notion é bem mais trabalho
13. **Multi-tenant de verdade** — hoje existe um único tenant fixo; as políticas de RLS já são escritas por `tenant_id`, então deve ser mais sobre lógica de qual tenant escolher do que reescrever segurança

---

**Minha recomendação**: os itens 🟢 são rápidos e fecham pontas soltas. O item 11 (IA consultora) é o que eu acho que mais aumenta o valor percebido pelo cliente final do escritório.
