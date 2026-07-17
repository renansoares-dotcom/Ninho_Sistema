# Ninho Consultoria — Diretrizes de Design (Fase 2)

Incorporei o prompt que você trouxe às diretrizes do projeto, com **um ajuste** conforme sua instrução: **menu superior no lugar de sidebar lateral**. Isso muda a estrutura de navegação, mas mantém 100% da filosofia visual (minimalista, premium, respirado, estilo Stripe/Linear/Notion).

Este documento passa a ser a referência oficial de UI para todas as telas da Fase 2.

---

## 1. Princípio Geral

Nível de referência: **Stripe, Linear, Notion, HubSpot**. Não é permitido: aparência de ERP antigo, excesso de bordas/caixas, campos soltos sem agrupamento, ícones pequenos e inconsistentes, poluição visual.

Sensação-alvo do usuário: *"esse sistema parece caro e sofisticado"*.

---

## 2. Navegação — Menu Superior (ajuste ao prompt original)

O prompt original sugeria sidebar; **substituída por menu superior fixo**, pelos seguintes motivos práticos que valem registrar:
- Libera largura horizontal total para os módulos com muitas colunas (CRM Kanban, tabelas financeiras, diagnóstico com radar)
- Funciona melhor no Portal do Cliente (visão mais enxuta, menos módulos)
- Reduz a sensação "ERP denso" que sidebars longas costumam gerar

**Estrutura do header:**
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo]   Dashboard  CRM  Clientes  Kanban  Diagnóstico  ▾ Mais  │  ← menu superior, itens principais
│                                          [Busca] [🔔] [Avatar]  │
├────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Clientes / Empresa XPTO                             │  ← header pequeno, contexto
│ Título da Tela                              [Ação Secundária] [Ação Principal] │
└────────────────────────────────────────────────────────────────┘
```
- Itens de menor uso (Financeiro, Automações, Configurações) ficam sob um dropdown "**Mais**" ou reorganizados por perfil (ex: Financeiro só aparece para Diretor/Financeiro)
- Menu superior é **contextual por perfil**: Consultor não vê "Financeiro", Cliente no Portal vê um menu reduzido (Meu Painel, Plano de Trabalho, Indicadores, Arquivos, Mensagens)
- Botões de ação principal sempre no canto superior direito da área de conteúdo, nunca no meio da tela

---

## 3. Agrupamento de Informação em Cards

Nada de dezenas de campos soltos lado a lado. Todo formulário/tela de detalhe é dividido em **cards temáticos**, um por grupo lógico. Exemplo aplicado a **Contrato Financeiro** (adaptando o exemplo do fluxo de caixa que você trouxe):

| Card | Campos |
|---|---|
| **Identificação** | Cliente, Consultor responsável, Nº do contrato, Status, Origem (oportunidade CRM) |
| **Valores** | Valor total, Nº de parcelas, Descontos, Juros/Multa, Valor pago, Saldo |
| **Datas** | Data de assinatura, Início, Fim, Vencimento próxima parcela |
| **Histórico** | Observações, Ocorrências, Alterações, Histórico de pagamentos |

Esse mesmo padrão se aplica a **Cliente**, **Diagnóstico**, **Visita**, **Oportunidade CRM** — cada um com seus grupos próprios, sempre 1 card = 1 tema.

---

## 4. Componentes e Padrões Visuais

| Elemento | Regra |
|---|---|
| **Cards** | Bordas discretas, sombra leve, padding generoso, sem linhas pesadas internas |
| **Formulários** | Campos altos, labels pequenas acima do campo, bom espaçamento vertical, sem múltiplas linhas divisórias |
| **Botões** | Tamanho médio, ícones Lucide, hover elegante, ação principal com destaque, "Excluir" só em destaque quando é a ação central da tela |
| **Tabelas** | Estilo Linear/HubSpot: cabeçalho elegante, linhas altas, hover na linha, paginação moderna, busca rápida acima da tabela, filtros recolhíveis |
| **Tipografia** | Família tipo Inter, hierarquia clara (título > subtítulo > label > corpo), nunca apertado |
| **Ícones** | Lucide em 100% do sistema, tamanho e peso consistentes |
| **Microinterações** | Hover, focus, loading, skeleton, badges, tooltips, dropdowns, transições suaves — nunca abruptas |

### Paleta
- Fundo: cinza muito claro (`#FAFAFA`–`#F5F5F7`)
- Cards: branco
- Primária: verde (a confirmar com a identidade visual oficial quando chegar — por enquanto uso um verde neutro tipo `#0E9F6E`)
- Sucesso: verde discreto | Erro: vermelho elegante | Aviso: laranja
- Regra dura: nunca mais de 2–3 cores simultâneas em uma mesma tela

### Base de componentes
shadcn/ui + Radix UI + Tailwind, seguindo exatamente a stack já definida na Fase 1.

---

## 5. Responsividade

Notebook, Full HD, UltraWide, tablet e celular. No mobile, o menu superior colapsa em menu hambúrguer com os mesmos itens (mantendo a hierarquia por perfil).

---

## 6. Onde isso já muda o que tínhamos combinado

- **Estrutura de pastas (Fase 1)**: nenhuma mudança nas rotas do Next.js — só muda o componente de layout (`components/shared/TopNav.tsx` no lugar de uma `Sidebar.tsx`)
- **Telas por módulo**: todas passam a seguir o padrão de cards agrupados descrito na seção 3, especialmente Clientes, Financeiro, Diagnóstico e Visitas
- Isso não afeta o modelo de dados nem os endpoints já definidos — é puramente camada de apresentação, como o próprio prompt que você trouxe deixa claro ("mesma lógica de negócio, UX redesenhada")

---

Com isso registrado, sigo para construir as primeiras telas da Fase 2: **Dashboard Executivo + CRM**, já usando menu superior e o padrão de cards acima.
