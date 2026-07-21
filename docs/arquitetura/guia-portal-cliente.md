# Ninho Consultoria — Guia do Portal do Cliente

## 1. Rodar a migration 026 no Supabase

No SQL Editor do Supabase, rode `packages/db/migrations/026_portal_cliente_rls.sql`
(depois da 025, que já precisa estar aplicada). Ela libera leitura, só dos
próprios dados, para o perfil `cliente` em: empresa, diagnóstico, plano de
trabalho, indicadores, arquivos, agenda (próxima reunião) e mensagens.

Por design, o Portal **não** expõe Kanban interno, Financeiro/Contratos nem
Visitas — segue a diretriz original de "menu reduzido" para esse perfil.

## 2. Criar um acesso de cliente

1. Crie o usuário no Supabase Auth normalmente (**Authentication → Users → Add user**, com "Auto Confirm User" marcado) — mesmo processo do guia de login.
2. No app, vá em **Configurações → Usuários e permissões**, ache a pessoa e troque o perfil para **Cliente**.
3. Assim que o perfil vira "Cliente", aparece um segundo campo, **"Empresa vinculada"** — selecione a empresa (registro em Clientes) que essa pessoa deve enxergar no Portal.

Sem esse vínculo, a pessoa consegue logar mas o Portal mostra uma tela
avisando que o acesso ainda está sendo configurado.

## 3. O que o cliente vê

| Seção | Conteúdo |
|---|---|
| **Meu Painel** | Resumo — progresso do projeto (diagnóstico + plano de trabalho + indicadores), próxima reunião agendada, atalhos |
| **Plano de Trabalho** | Ações do plano, com status, responsável e prazo — somente leitura |
| **Indicadores** | Gráfico de evolução de cada KPI acompanhado — somente leitura |
| **Arquivos** | Lista de arquivos vinculados à empresa, com download |
| **Mensagens** | Chat direto com a equipe da consultoria |

## 4. Mensagens — os dois lados da conversa

O cliente manda mensagem pelo Portal (`/portal/mensagens`); a equipe interna
responde pela aba **"Mensagens"** dentro do Workspace do cliente
(`Clientes → [empresa] → Mensagens`). Os dois lados usam a mesma tabela
(`comentarios`, com `entidade_tipo = 'cliente_mensagem'`), então a conversa
aparece em tempo real (via reload) dos dois lados.

## 5. Limitação conhecida do bucket de Arquivos

O bucket `arquivos` no Storage foi criado como **público** (migration 013,
antes do login existir). Isso significa que, tecnicamente, qualquer pessoa
com o link direto de um arquivo consegue abri-lo, mesmo sem estar logada —
o RLS da tabela `arquivos` controla quem *descobre* o link dentro do app,
mas não impede o acesso direto a uma URL que já vazou. Pra fechar esse
buraco de vez, o bucket precisaria virar privado e os links passar a ser
gerados sob demanda (`createSignedUrl`) — não fizemos isso agora pra não
quebrar os links já salvos, mas é uma boa próxima melhoria de segurança.

## 6. O que ainda não existe

- Notificação por e-mail quando chega uma mensagem nova ou um arquivo novo.
- Cliente não pode ter mais de uma empresa vinculada (cenário de grupo econômico).
- Sem app mobile dedicado — o Portal é responsivo, mas é a mesma interface web.
