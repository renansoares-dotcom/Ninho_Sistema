# Ninho Consultoria — Evolução para Workspaces (Fase 3.5)

**Princípio inegociável, confirmado:** mesma arquitetura (Next.js App Router + Tailwind + Supabase), mesma estrutura de pastas, mesmo padrão de componentes (`components/shared/`, `PageHeader`, `Card`, modais de formulário). Tudo abaixo é **aprofundamento de UX e funcionalidade**, não reescrita.

## Como o vocabulário muda (sem mudar a base técnica)

| Antes (módulo) | Depois (Workspace) | O que muda na prática |
|---|---|---|
| Cadastro de Cliente | **Workspace da Empresa** | A tela `/clientes/[id]` ganha abas: Visão Geral, Indicadores, Timeline, Kanban, Agenda, Arquivos, Financeiro, IA — tudo filtrado por aquele cliente, sem sair da URL |
| Kanban genérico | **Workspace de Execução** | Cards ganham profundidade: descrição rica, checklist, comentários, anexos, dependências, tempo estimado x realizado |
| CRM (funil) | **Workspace de Relacionamento** | A oportunidade e o cliente pós-venda compartilham uma timeline única de tudo que aconteceu (ligação, reunião, e-mail, proposta, contrato) |

Nenhuma dessas mudanças exige nova tecnologia — são evoluções de UI dentro das páginas que já existem, mais algumas tabelas novas no Supabase (comentários, anexos, checklist_items, campos expandidos em `clientes`).

## Roadmap sugerido, em ordem de valor prático

### Etapa A — Workspace da Empresa (maior impacto, base pra tudo mais)
Transformar `/clientes/[id]` num hub com abas, reunindo o que já existe (contatos, financeiro real que já conectamos) + o que falta (arquivos, agenda filtrada, kanban filtrado). Isso é o coração do conceito "Workspace" e organiza tudo que vem depois.

### Etapa B — Cadastro de Empresa expandido
Adicionar os campos que você listou (CNAEs, regime tributário, capital social, ERP, banco, redes sociais, organograma, tags) ao formulário e à tabela `clientes` — extensão de schema, não redesenho.

### Etapa C — Workspace de Execução (Kanban avançado)
Cards clicáveis abrindo um painel lateral completo: descrição rica, checklist com progresso, comentários, anexos, dependências entre tarefas, tempo estimado x realizado. (Editor "tipo Notion" fica pra uma sub-etapa depois, é o item mais complexo tecnicamente.)

### Etapa D — Workspace de Relacionamento (CRM + timeline unificada)
Score, temperatura do lead, motivo de perda, e a timeline que junta atividades do CRM com histórico pós-venda do cliente.

### Etapa E — Diagnóstico analítico
Heatmap, matriz de prioridades, riscos e recomendações geradas a partir das notas por área que já coletamos.

### Etapa F — Dashboard personalizável, Arquivos (Drive-like), Agenda multi-visão, IA
Essas entram depois das anteriores, pois dependem de mais dados reais já fluindo pelo sistema pra fazer sentido (ex: dashboard de widgets é mais valioso quando já tem KPIs de verdade por cliente).

## O que eu recomendo como próximo passo concreto

Fechar primeiro os módulos de leitura/escrita que já estão pela metade (**Agenda** e **Financeiro** ainda sem CRUD) antes de começar a Etapa A — assim toda a base de dados fica com CRUD completo antes de começarmos a "empilhar" os Workspaces em cima.
