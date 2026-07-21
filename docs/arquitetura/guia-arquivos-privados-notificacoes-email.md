# Ninho Consultoria — Guia: Arquivos privados, notificação bidirecional e e-mail

## 1. Bucket de Arquivos agora é privado

Rode `packages/db/migrations/030_bucket_arquivos_privado.sql` (depois de 025 em diante). Ela:
- Cria uma coluna `caminho` em `arquivos` e `tarefa_anexos`, preenchendo automaticamente a partir das URLs antigas (não perde nada do que já foi enviado)
- Torna o bucket `arquivos` privado no Storage
- O app agora gera um **link temporário** (expira em 60 segundos) toda vez que alguém clica em "Abrir" — em vez de uma URL pública fixa que qualquer um com o link conseguia acessar, mesmo sem estar logado

Isso vale tanto pros Arquivos do Workspace quanto pros anexos de tarefa no Kanban (aliás, o upload de anexos do Kanban já era real desde antes — só melhorei a parte de segurança dele junto).

## 2. Mensagens — notificação nos dois sentidos

Antes: só o cliente mandando mensagem avisava a equipe. Agora, com a migration `031_notificacao_bidirecional_mensagens.sql` (depois de 027), quando a **equipe responde**, o cliente também é avisado — e o Portal ganhou um sino de notificações próprio (mesmo componente do sistema principal, no cabeçalho ao lado do "Sair").

## 3. Notificação por e-mail

Passo novo de configuração — dessa vez é uma conta externa nova, não é algo que já existia no Supabase/Vercel.

1. Crie uma conta gratuita em [resend.com](https://resend.com)
2. **API Keys → Create API Key** — copia a chave
3. Na Vercel: **Settings → Environment Variables**
   - `RESEND_API_KEY` = a chave que você copiou
   - `EMAIL_REMETENTE` = pode deixar em branco pra testar (usa um remetente de teste do próprio Resend, funciona pra poucos envios sem precisar configurar domínio). Quando quiser usar seu próprio domínio (ex: `notificacoes@suaconsultoria.com.br`), siga o passo "Domains" no painel do Resend pra verificar o domínio, depois preencha esse campo no formato `Ninho Consultoria <notificacoes@suaconsultoria.com.br>`
4. Redeploy

**Onde o e-mail dispara hoje:**
- Cliente manda mensagem no Portal → e-mail pro consultor responsável + Admin/Diretor
- Equipe responde no Workspace → e-mail pro(s) usuário(s) com acesso ao Portal daquela empresa
- Novo diagnóstico público recebido → e-mail pra Admin/Diretor

Se `RESEND_API_KEY` não estiver configurada, nada quebra — o app simplesmente não manda e-mail (a notificação dentro do sino continua funcionando normalmente, isso não depende do Resend).
