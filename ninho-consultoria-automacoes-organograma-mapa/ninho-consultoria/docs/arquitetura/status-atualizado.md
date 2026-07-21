# Ninho Consultoria — Status atualizado

## Concluido ate agora

Fases 1-3 completas: Arquitetura, Interface (todos os modulos), Backend/Supabase conectado, CRUD completo em todos os modulos principais.

Evolucao para Workspaces (Etapas A-F): Workspace da Empresa com abas, Cadastro expandido, Kanban avancado (checklist/comentarios/anexos/dependencias), CRM avancado (score/temperatura/dashboard comercial), Diagnostico analitico (heatmap/prioridades/recomendacoes), Dashboard personalizavel, Arquivos (upload real + drag-and-drop), Agenda avancada (dia/semana/mes/recorrencia).

Itens de baixa complexidade: e-mail de NFe, notificacoes reais, editar diagnostico, upload real de anexos, modulo de Visitas.

Itens de media complexidade concluidos:
- Faturamento completo (emissao simulada de NFS-e)
- Plano de Trabalho (integrado ao diagnostico)
- KPIs (comparativo antes x depois)
- Relatorios em PDF reais (diagnostico + plano de trabalho)

Dados de teste: 10 exemplos em praticamente todos os modulos.

Login real (Supabase Auth) + RLS por perfil: implementado. Sessao via cookies (@supabase/ssr), middleware protegendo todas as rotas internas, menu superior contextual por perfil (Admin/Diretor veem tudo; Coordenador/Consultor sem Financeiro/Automacoes/Configuracoes; Financeiro com acesso financeiro; Cliente redirecionado para /portal), tela de "esqueci minha senha" / redefinicao, gestao de usuarios e perfis em Configuracoes, e RLS real (nao mais "allow all") nas 29 tabelas do banco — ver `packages/db/migrations/025_login_auth_rls.sql` e `docs/arquitetura/guia-login-auth.md` para o passo a passo de ativacao no Supabase.

Portal do Cliente: implementado. Meu Painel (progresso do projeto, proxima reuniao, atalhos), Plano de Trabalho, Indicadores, Arquivos e Mensagens (chat em tempo real com a equipe interna — aba nova no Workspace do cliente), tudo com RLS escopado por `profiles.cliente_id`. Gestao de usuarios em Configuracoes ganhou o campo "Empresa vinculada" pra ligar um perfil Cliente a um registro em Clientes. Ver `packages/db/migrations/026_portal_cliente_rls.sql` e `docs/arquitetura/guia-portal-cliente.md`.

Notificacao de mensagem nova: implementado (migration 027) — gatilho no banco notifica consultor responsavel + Admin/Diretor quando um cliente manda mensagem pelo Portal; sino atualiza sozinho a cada ~25s.

Diagnostico Publico + Campanhas de Acompanhamento: implementado (migration 028). Link publico `/diagnostico-publico` com quiz de perguntas editaveis (pesos somando 10, gerenciado em Configuracoes), resultado teaser na hora, fila de revisao em Diagnostico > Recebidos (importar vira Cliente Prospect + Lead no CRM, ou descartar). Campanhas de acompanhamento sazonais liberam o formulario de 9 areas no Portal do Cliente, uma resposta por campanha, com liberacao manual de reenvio pelo admin.

Identidade Visual: implementado (migration 029). Upload de logo por tenant em Configuracoes, aplicado no sistema, Portal, Diagnostico Publico e telas de Login.

Automacoes reais: implementado. Os 5 gatilhos de /automacoes tem logica de verdade agora (2 novos: contrato vencendo, nova atividade CRM), bug de notificacao sem destinatario corrigido, e Vercel Cron rodando checagens periodicas 1x/dia de verdade (precisa configurar CRON_SECRET na Vercel).

Organograma: virou grafico visual (caixas conectadas por linhas). Mapa: busca automatica de coordenadas pelo endereco via OpenStreetMap/Nominatim.

Ver docs/arquitetura/guia-automacoes-organograma-mapa.md.

## Ainda restam (media complexidade)

1. Automacoes reais - hoje os toggles de /automacoes nao disparam nada de verdade
2. Organograma e mapa de localizacao no cadastro de cliente

## Restam (alta complexidade)

3. IA consultora (integracao OpenAI)
4. Editor de texto rico no Kanban
5. Multi-tenant de verdade (RLS ja preparado por tenant_id; falta a logica de multiplos tenants)

## Recomendacao

Os itens 1 e 2 (rapidos) continuam sendo o menor esforco. Depois deles, a IA consultora e o proximo salto de valor.
