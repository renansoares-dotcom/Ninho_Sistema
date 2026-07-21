# Ninho Consultoria — Guia de Login/Auth (Supabase Auth)

Passo a passo pra colocar o login real no ar depois que essa etapa foi implementada no código.

## 1. Instalar a nova dependência

```bash
cd apps/web
npm install
```

(`@supabase/ssr` foi adicionado ao `package.json` — é a lib que sincroniza a sessão entre navegador, middleware e Server Components.)

## 2. Rodar a migration 025 no Supabase

No painel do Supabase, vá em **SQL Editor > New query**, cole o conteúdo de
`packages/db/migrations/025_login_auth_rls.sql` e rode.

Essa migration:
- Remove todas as policies `temp_allow_all_*` (acesso liberado geral).
- Cria policies reais por perfil (role) e por `tenant_id`.
- Cria um gatilho que provisiona automaticamente um `profiles` toda vez que
  alguém é criado no Supabase Auth.

⚠️ **Rode com pelo menos um usuário já existindo no Auth** (veja passo 3) —
assim que a migration remover o acesso liberado, você precisa conseguir
logar com um Admin de verdade pra tudo continuar funcionando.

## 3. Criar o primeiro usuário (Admin)

No painel do Supabase: **Authentication > Users > Add user**.
- E-mail e senha da pessoa.
- Em "User Metadata" (JSON), opcionalmente já defina o perfil e o nome:
  ```json
  { "nome": "Seu Nome", "role": "admin" }
  ```
  Se não preencher `role`, a pessoa entra como `consultor` por padrão — dá
  pra trocar depois em **Configurações > Usuários e permissões**, mas só um
  Admin/Diretor já existente consegue fazer essa troca. Por isso, garanta
  que o **primeiro** usuário já nasça com `"role": "admin"` no metadata,
  ou troque a role dele direto no banco (SQL Editor):
  ```sql
  update public.profiles set role = 'admin' where email = 'voce@suaempresa.com';
  ```

Repare: como o usuário só ganha uma linha em `profiles` no momento em que é
criado no Auth (gatilho `on_auth_user_created`), ele precisa existir no Auth
*antes* de aparecer na tela de Usuários.

## 4. Variáveis de ambiente

`apps/web/.env.local` (copie de `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://seu-dominio-de-producao.com
```
`NEXT_PUBLIC_SITE_URL` é usado no link de "esqueci minha senha" — em
desenvolvimento local pode deixar em branco (cai no fallback `localhost:3000`).

No painel do Supabase, em **Authentication > URL Configuration**, adicione
`https://seu-dominio/auth/confirm` (e o equivalente local) na lista de Redirect URLs.

## 5. Perfis de acesso (roles)

| Perfil | O que vê |
|---|---|
| `admin` / `diretor` | Tudo, incluindo Financeiro, Automações, Configurações e gestão de usuários |
| `coordenador` / `consultor` | Módulos operacionais (Dashboard, CRM, Clientes, Kanban, Diagnóstico, Agenda, Visitas, Plano de Trabalho, Arquivos, Relatórios) — sem Financeiro/Faturamento/Automações/Configurações |
| `financeiro` | Igual acima + Financeiro e Faturamento (leitura e escrita) |
| `cliente` | Não acessa a área interna — é redirecionado para `/portal` (hoje uma tela simples de "em construção"; é o próximo passo grande do roadmap) |

A troca de perfil de qualquer pessoa é feita em **Configurações > Usuários e
permissões** (só visível para Admin/Diretor).

## 6. O que ainda fica de fora dessa etapa (propositalmente)

- **Multi-tenant de verdade**: o sistema continua funcionando com um único
  tenant fixo (o gatilho de provisionamento sempre usa o primeiro tenant
  cadastrado). As policies já são escritas *por tenant_id*, então já estão
  prontas para quando o multi-tenant real for implementado — não deve
  exigir reescrever RLS, só a lógica de qual tenant escolher.
- **Portal do Cliente**: o perfil `cliente` já funciona no login e já é
  isolado por RLS (só enxerga a própria linha em `profiles`), mas as telas
  do portal em si (plano de trabalho, indicadores, arquivos do cliente)
  ainda não foram construídas.
- **Cadastro público / self-signup**: propositalmente não existe. Contas são
  sempre criadas por um Admin via painel do Supabase — é o padrão esperado
  pra uma ferramenta interna B2B como essa.
