# Ninho Consultoria — Guia: Diagnóstico Público + Campanhas de Acompanhamento

Duas funcionalidades novas, que nasceram da mesma ideia mas resolvem problemas diferentes:

1. **Diagnóstico Público** — link público (sem login) pra captar leads novos, com um mini-quiz e resultado na hora.
2. **Campanhas de Acompanhamento** — janela sazonal, controlada pelo escritório, onde clientes já ativos preenchem um diagnóstico de verdade (as mesmas 9 áreas do módulo interno) pelo Portal.

## 1. Rodar a migration

`packages/db/migrations/028_diagnostico_campanhas_publico.sql` (depois de 025, 026, 027). Ela já semeia 7 perguntas padrão pro diagnóstico público (pesos somando 10) — edite à vontade depois.

## 2. Variável de ambiente nova: Service Role Key

O formulário público **não** usa o mesmo caminho de banco do resto do app (que exige login). Ele passa por uma rota de servidor (`app/api/diagnostico-publico`) que usa a **Service Role Key** do Supabase — uma chave que ignora RLS e só pode existir no servidor.

- Pegue em: **Supabase → Project Settings → API → service_role** (é a chave secreta, não a `anon`/`public`)
- Coloque em `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (e nas variáveis de ambiente do seu deploy, ex: Vercel)
- **Nunca** prefixe com `NEXT_PUBLIC_` — isso a exporia no navegador

Sem essa chave configurada, o link público carrega mas não consegue nem mostrar as perguntas.

## 3. Editando as perguntas do link público

**Configurações → Perguntas do Diagnóstico Público** (só Admin/Diretor veem):
- Editar o texto: clique no campo, edite, saia do campo (salva sozinho)
- Peso: mesma lógica, em pontos
- Adicionar: botão "Nova pergunta"
- Excluir: ícone de lixeira
- Reordenar: setas pra cima/baixo

**Regra que o painel mostra mas não bloqueia sozinho**: os pesos das perguntas *ativas* precisam somar exatamente **10** — é o que garante que a nota final fique numa escala de 0 a 10, igual ao resto do sistema. O painel avisa em vermelho/amarelo se a soma estiver errada; ajuste antes de divulgar o link.

Se você editar o texto de uma pergunta depois que já tem gente que respondeu, os envios antigos mantêm o texto de quando foram respondidos (fica guardado junto com a resposta) — então o histórico nunca fica "desalinhado".

## 4. O link público

URL: `https://seu-dominio/diagnostico-publico` — pode divulgar direto (Instagram bio, WhatsApp, anúncio, o que for). Não precisa de nada especial, é uma página normal do Next.js.

Fluxo pro visitante: nome/e-mail/celular → perguntas (slider 0-10 cada) → resultado na hora (nota de 0 a 10 com selo de estágio).

Proteções incluídas:
- Campo honeypot (invisível, só bot preenche) — se vier preenchido, a submissão é silenciosamente ignorada
- Mesmo e-mail não consegue enviar de novo em menos de 24h (mostra a nota anterior)
- O peso de cada pergunta é sempre recalculado no servidor a partir do banco — o navegador nunca decide a nota sozinho

**O que essa submissão NÃO faz**: não cria Cliente nem Lead automaticamente. Fica esperando revisão humana (ver próximo item).

## 5. Revisando os leads recebidos

**Diagnóstico → aba "Recebidos (link público)"** (com contador de pendentes). Cada linha mostra nome, e-mail, celular, nota, e um botão pra expandir as respostas pergunta a pergunta.

- **Importar**: cria um Cliente (status Prospect) + contato principal + uma Oportunidade no CRM (etapa "Lead", origem "Diagnóstico público") — a partir daí segue o fluxo normal do CRM que vocês já usam.
- **Descartar**: só marca como descartado, some da lista (fica no banco pra histórico, mas não aparece mais como pendente).

## 6. Campanhas de Acompanhamento (clientes já ativos)

**Configurações → Diagnóstico de Acompanhamento** (só Admin/Diretor):
- **Abrir campanha**: dá um nome (ex: "Acompanhamento — 3º trimestre 2026") e ativa. A partir daí, todo cliente logado no Portal vê um banner no Meu Painel convidando a preencher.
- O formulário que o cliente preenche é **o mesmo formulário de 9 áreas do diagnóstico interno** — então o resultado entra no histórico dele, no Health Score, no radar, em tudo que já existe.
- **Só pode responder uma vez por campanha.** Depois que responde, o formulário some pra ele.
- **Encerrar campanha**: reativa quando quiser abrir outra — só existe uma ativa por vez.
- **Liberar novo envio**: se um cliente errou ou precisa reenviar, no mesmo painel aparece a lista de quem já respondeu com um botão "Liberar novo envio" por pessoa — libera só aquele cliente específico, sem precisar encerrar a campanha pra todo mundo.

## 7. Limitações conhecidas

- O sistema ainda assume um único tenant (a rota pública sempre usa o primeiro tenant cadastrado) — consistente com o resto do produto até o multi-tenant de verdade existir.
- Sem captcha visual (só honeypot + limite de reenvio por e-mail) — suficiente contra bots simples, mas não contra spam mais sofisticado. Se virar um problema, dá pra adicionar reCAPTCHA/hCaptcha depois.
- O resultado teaser é só a nota — sem um "relatório" mais elaborado pro visitante. Isso pode ser uma boa evolução futura (ex: gerar um PDF ou uma página de resultado mais rica por faixa de nota).
