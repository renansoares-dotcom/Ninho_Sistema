# Ninho Consultoria — Guia: Automações reais, Organograma visual e Mapa

## 1. Automações — o que cada gatilho faz agora

Todos os 5 gatilhos de `/automacoes` têm lógica de verdade agora (antes, 2 já funcionavam parcialmente e 2 não tinham nenhuma lógica):

| Gatilho | Tipo | O que faz |
|---|---|---|
| Diagnóstico concluído | Na hora | Cria uma tarefa de revisão no Kanban + notifica Admin/Diretor |
| Parcela vencendo (3 dias) | Periódico | Notifica Admin/Diretor/Financeiro |
| Contrato vencendo (15 dias) | Periódico | Notifica Admin/Diretor/Financeiro — **novo** |
| Tarefa atrasada | Periódico | Notifica o responsável pela tarefa (+ Admin/Diretor) |
| Nova atividade no CRM | Na hora | Notifica Admin/Diretor quando alguém registra ligação/e-mail/reunião numa oportunidade — **novo** |

Corrigi também um bug real: as notificações criadas por automação não tinham destinatário definido (`profile_id` vazio), então mesmo quando a automação "funcionava", a notificação nunca aparecia pro sino de ninguém. Agora cada notificação é endereçada a pessoas específicas.

## 2. Verificação automática de verdade (Vercel Cron)

Antes, as verificações periódicas (parcela/contrato vencendo, tarefa atrasada) só rodavam quando alguém abria o Dashboard — ou seja, não eram automáticas de fato. Agora existe uma rotina que roda sozinha, uma vez por dia, sem depender de ninguém estar logado.

**Passo obrigatório**: adicione uma variável de ambiente na Vercel:
- **Key**: `CRON_SECRET`
- **Value**: qualquer texto longo e aleatório (ex: gere em [1password.com/password-generator](https://1password.com/password-generator) ou similar) — serve só pra garantir que ninguém além da própria Vercel consiga chamar essa rotina
- Marque Production, Preview e Development, salve, e faça um redeploy (mesma rotina de sempre)

A Vercel identifica automaticamente que `CRON_SECRET` existe e passa a incluir esse valor nas chamadas do cron job — não precisa fazer mais nada além de configurar a variável. O agendamento (`vercel.json`, na raiz do projeto Next.js) está configurado pra rodar todo dia às 11h UTC (~8h no horário de Brasília).

## 3. Organograma — agora é um gráfico de verdade

Na aba "Visão Geral" do Workspace do cliente, o Organograma deixou de ser uma lista com recuo e virou um gráfico visual (caixas conectadas por linhas, níveis hierárquicos lado a lado). Ao remover alguém que tinha subordinados, eles sobem automaticamente um nível (não ficam "órfãos").

## 4. Mapa — busca automática de coordenadas

Antes, era preciso saber a latitude/longitude de cabeça (ou ir catar no Google Maps manualmente). Agora, ao editar um cliente, depois de preencher cidade/UF (endereço completo se tiver), o botão **"Buscar pelo endereço"** preenche automaticamente — usa o serviço gratuito OpenStreetMap/Nominatim, sem precisar de chave de API nem custo. Se o endereço não for encontrado, ainda dá pra preencher manualmente.

## 5. Logo nas telas de Login

A logo enviada em Configurações → Identidade Visual agora também aparece nas telas de Login, Esqueci Minha Senha e Redefinir Senha — antes só aparecia depois de logado.
