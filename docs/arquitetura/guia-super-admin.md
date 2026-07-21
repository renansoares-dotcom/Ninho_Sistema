# Ninho Consultoria — Guia: Multi-tenant real + Painel de Super Admin

## Modelo adotado

Um único domínio pra todo mundo (sem subdomínio por escritório). Cada
usuário pertence a um escritório (`tenant_id` no perfil dele) — o sistema
sabe de qual escritório é assim que a pessoa loga, não pela URL.

## 1. Rodar as migrations, na ordem

1. `032` (rodada por você via texto, no início dessa etapa) — cria `super_admins`, `tenants.slug`, corrige o gatilho de criação de usuário
2. `033_super_admin_plataforma.sql` — fecha o RLS de `super_admins`, cria `tenants.ativo` (suspensão) e a tabela `tenant_assinaturas` (financeiro)

## 2. Se tornar Super Admin

Depois da migration 032, rode (trocando pelo seu e-mail):
```sql
insert into super_admins (id, email)
select id, email from auth.users where email = 'seu-email@aqui.com'
on conflict (id) do nothing;
```

## 3. O painel — `/admin`

Só quem está na tabela `super_admins` acessa. É visualmente diferente do
resto do sistema (fundo escuro) de propósito — pra nunca confundir com a
área de um escritório específico.

**Escritórios** (`/admin`)
- Lista todos, com contagem de usuários e clientes
- **Novo escritório**: cria o tenant + configurações padrão + as 5
  automações (desativadas) + as 7 perguntas do Diagnóstico Público + o
  primeiro usuário Admin, tudo de uma vez
- **Suspender/Reativar**: bloqueia login de todo mundo daquele escritório
  na hora (checado tanto na entrada do login quanto a cada carregamento de
  página, então até quem já estava logado é desconectado)

**Financeiro** (`/admin/financeiro`)
- Uma ficha por escritório: plano, valor mensal, status de pagamento
  (Em dia/Atrasado/Cancelado/Trial), próximo vencimento, observações
- Mostra o MRR total (soma de quem está "Em dia") no topo
- Edição direto na lista — clica, edita, sai do campo, salva sozinho
- **Isso é um controle manual**, não um gateway de pagamento — você mesmo
  atualiza quando recebe. Se um dia quiser cobrança automática, integrar
  Stripe é o próximo passo natural (fica de fora por enquanto)

**Usuários** (`/admin/usuarios`)
- Todos os usuários, de todos os escritórios, numa lista só, com busca
- Botão pra bloquear/reativar o acesso de qualquer pessoa, cruzando tenants
  (diferente da tela "Usuários" de dentro de um escritório, que só mexe
  nos usuários daquele escritório)

## 4. Diagnóstico Público — agora por escritório

- Link padrão (o que já estava divulicado): `/diagnostico-publico` — continua igual, aponta pro primeiro tenant cadastrado
- Escritórios novos ganham o próprio link com slug: `/diagnostico-publico/[slug]` — o slug é definido na hora de criar o escritório em `/admin/novo`

## 5. O que ficou de fora por enquanto ("ajustamos no decorrer")

- **Cobrança automática** (Stripe ou similar) — hoje o financeiro é uma ficha manual
- **Controle de quais módulos cada escritório pode usar** (ex: plano básico sem Portal do Cliente) — hoje todo escritório tem acesso a tudo
- **Editar/trocar o slug** de um escritório depois de criado — hoje só define na criação
- **Convite por e-mail** pro primeiro admin — hoje você define a senha na hora e repassa manualmente
