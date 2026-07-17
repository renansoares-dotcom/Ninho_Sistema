export const receitaMensal = [
  { mes: "Fev", valor: 182 },
  { mes: "Mar", valor: 196 },
  { mes: "Abr", valor: 208 },
  { mes: "Mai", valor: 221 },
  { mes: "Jun", valor: 214 },
  { mes: "Jul", valor: 247 },
];

export const funilData = [
  { etapa: "Lead", qtd: 64 },
  { etapa: "Contato", qtd: 48 },
  { etapa: "Reunião", qtd: 33 },
  { etapa: "Diagnóstico", qtd: 21 },
  { etapa: "Proposta", qtd: 15 },
  { etapa: "Negociação", qtd: 9 },
  { etapa: "Contrato", qtd: 6 },
];

export const atividadesRecentes = [
  { titulo: "Diagnóstico concluído — Grupo Alvorada", tempo: "há 24 min" },
  { titulo: "Contrato assinado — Metalúrgica Ferro Sul", tempo: "há 1 h" },
  { titulo: "Visita registrada — Padaria Trigo Dourado", tempo: "há 3 h" },
  { titulo: "Nova oportunidade — Studio Criativo Nix", tempo: "há 5 h" },
  { titulo: "Parcela vencida — Comércio Vale Verde", tempo: "ontem" },
];

export const produtividade = [
  { nome: "Marina Costa", pct: 92 },
  { nome: "Rafael Souza", pct: 84 },
  { nome: "Juliana Prado", pct: 78 },
  { nome: "Bruno Alencar", pct: 65 },
];

export const colunasCRM = [
  { id: "lead", nome: "Lead", cor: "#94a3b8" },
  { id: "contato", nome: "Contato", cor: "#60a5fa" },
  { id: "reuniao", nome: "Reunião", cor: "#818cf8" },
  { id: "diagnostico", nome: "Diagnóstico", cor: "#c084fc" },
  { id: "proposta", nome: "Proposta", cor: "#f0abfc" },
  { id: "negociacao", nome: "Negociação", cor: "#fbbf24" },
  { id: "contrato", nome: "Contrato", cor: "#34d399" },
  { id: "ativo", nome: "Cliente Ativo", cor: "#004AAD" },
];

export const oportunidades = [
  { id: 1, empresa: "Studio Criativo Nix", etapa: "lead", valor: "R$ 18.000", prob: 20, dias: 2, resp: "MC" },
  { id: 2, empresa: "Vale Verde Comércio", etapa: "lead", valor: "R$ 9.500", prob: 15, dias: 6, resp: "RS" },
  { id: 3, empresa: "Trigo Dourado Padaria", etapa: "contato", valor: "R$ 12.000", prob: 30, dias: 3, resp: "JP" },
  { id: 4, empresa: "Ferro Sul Metalúrgica", etapa: "reuniao", valor: "R$ 64.000", prob: 45, dias: 5, resp: "MC" },
  { id: 5, empresa: "Grupo Alvorada", etapa: "diagnostico", valor: "R$ 38.000", prob: 55, dias: 8, resp: "BA" },
  { id: 6, empresa: "Nova Era Logística", etapa: "diagnostico", valor: "R$ 27.500", prob: 50, dias: 4, resp: "RS" },
  { id: 7, empresa: "Doce Sabor Alimentos", etapa: "proposta", valor: "R$ 21.000", prob: 65, dias: 6, resp: "JP" },
  { id: 8, empresa: "Construtora Horizonte", etapa: "negociacao", valor: "R$ 92.000", prob: 75, dias: 9, resp: "MC" },
  { id: 9, empresa: "TechFlow Sistemas", etapa: "contrato", valor: "R$ 45.000", prob: 90, dias: 2, resp: "BA" },
  { id: 10, empresa: "Metalúrgica Ferro Sul", etapa: "ativo", valor: "R$ 64.000", prob: 100, dias: 0, resp: "MC" },
];

export const clientes = [
  { id: 1, nome: "Metalúrgica Ferro Sul", segmento: "Indústria", status: "Ativo", faturamento: "R$ 4,2 mi/ano", resp: "MC", ultimaAtividade: "há 2 dias" },
  { id: 2, nome: "TechFlow Sistemas", segmento: "Tecnologia", status: "Ativo", faturamento: "R$ 1,8 mi/ano", resp: "BA", ultimaAtividade: "há 5 dias" },
  { id: 3, nome: "Padaria Trigo Dourado", segmento: "Alimentício", status: "Ativo", faturamento: "R$ 620 mil/ano", resp: "JP", ultimaAtividade: "há 3 horas" },
  { id: 4, nome: "Construtora Horizonte", segmento: "Construção Civil", status: "Prospect", faturamento: "R$ 9,5 mi/ano", resp: "MC", ultimaAtividade: "há 1 semana" },
  { id: 5, nome: "Doce Sabor Alimentos", segmento: "Alimentício", status: "Ativo", faturamento: "R$ 1,1 mi/ano", resp: "JP", ultimaAtividade: "há 1 dia" },
  { id: 6, nome: "Nova Era Logística", segmento: "Logística", status: "Prospect", faturamento: "R$ 2,4 mi/ano", resp: "RS", ultimaAtividade: "há 4 dias" },
  { id: 7, nome: "Grupo Alvorada", segmento: "Varejo", status: "Ativo", faturamento: "R$ 3,1 mi/ano", resp: "BA", ultimaAtividade: "há 6 horas" },
  { id: 8, nome: "Vale Verde Comércio", segmento: "Varejo", status: "Inativo", faturamento: "R$ 480 mil/ano", resp: "RS", ultimaAtividade: "há 3 semanas" },
];

export const colunasKanban = [
  { id: "afazer", nome: "A Fazer", cor: "#94a3b8" },
  { id: "andamento", nome: "Em Andamento", cor: "#004AAD" },
  { id: "revisao", nome: "Em Revisão", cor: "#f59e0b" },
  { id: "concluido", nome: "Concluído", cor: "#34d399" },
];

export const tarefasKanban = [
  { id: 1, titulo: "Levantar dados financeiros", cliente: "Grupo Alvorada", coluna: "afazer", prioridade: "Alta", prazo: "22/07", resp: "BA" },
  { id: 2, titulo: "Montar apresentação do diagnóstico", cliente: "Ferro Sul Metalúrgica", coluna: "afazer", prioridade: "Média", prazo: "25/07", resp: "MC" },
  { id: 3, titulo: "Reunião de alinhamento de plano", cliente: "Nova Era Logística", coluna: "andamento", prioridade: "Alta", prazo: "19/07", resp: "RS" },
  { id: 4, titulo: "Ajustar precificação de produtos", cliente: "Padaria Trigo Dourado", coluna: "andamento", prioridade: "Média", prazo: "21/07", resp: "JP" },
  { id: 5, titulo: "Estruturar centro de custos", cliente: "TechFlow Sistemas", coluna: "andamento", prioridade: "Alta", prazo: "20/07", resp: "BA" },
  { id: 6, titulo: "Revisar fluxo de caixa projetado", cliente: "Doce Sabor Alimentos", coluna: "revisao", prioridade: "Média", prazo: "18/07", resp: "JP" },
  { id: 7, titulo: "Plano de ação — RH", cliente: "Grupo Alvorada", coluna: "concluido", prioridade: "Baixa", prazo: "15/07", resp: "MC" },
  { id: 8, titulo: "Diagnóstico fiscal inicial", cliente: "Metalúrgica Ferro Sul", coluna: "concluido", prioridade: "Alta", prazo: "12/07", resp: "RS" },
];

export const diagnosticos = [
  { id: 1, cliente: "Grupo Alvorada", data: "10/07/2026", indice: 7.2, status: "Concluído" },
  { id: 2, cliente: "Metalúrgica Ferro Sul", data: "05/07/2026", indice: 6.4, status: "Concluído" },
  { id: 3, cliente: "Nova Era Logística", data: "14/07/2026", indice: 5.8, status: "Em andamento" },
  { id: 4, cliente: "TechFlow Sistemas", data: "16/07/2026", indice: 0, status: "Em preenchimento" },
];

export const eventosAgenda = [
  { id: 1, titulo: "Reunião de diagnóstico — Nova Era Logística", tipo: "Reunião", data: "Hoje", dataISO: "2026-07-17", hora: "10:00", resp: "RS" },
  { id: 2, titulo: "Visita técnica — Padaria Trigo Dourado", tipo: "Visita técnica", data: "Hoje", dataISO: "2026-07-17", hora: "14:30", resp: "JP" },
  { id: 3, titulo: "Apresentação do plano de trabalho — Grupo Alvorada", tipo: "Videoconferência", data: "Amanhã", dataISO: "2026-07-18", hora: "09:00", resp: "BA" },
  { id: 4, titulo: "Alinhamento comercial — Construtora Horizonte", tipo: "Reunião", data: "Amanhã", dataISO: "2026-07-18", hora: "16:00", resp: "MC" },
  { id: 5, titulo: "Visita técnica — Metalúrgica Ferro Sul", tipo: "Visita técnica", data: "20/07", dataISO: "2026-07-20", hora: "08:30", resp: "MC" },
  { id: 6, titulo: "Follow-up comercial — Studio Criativo Nix", tipo: "Videoconferência", data: "21/07", dataISO: "2026-07-21", hora: "11:00", resp: "MC" },
  { id: 7, titulo: "Reunião de fechamento — Doce Sabor Alimentos", tipo: "Reunião", data: "24/07", dataISO: "2026-07-24", hora: "10:30", resp: "JP" },
  { id: 8, titulo: "Visita técnica — TechFlow Sistemas", tipo: "Visita técnica", data: "28/07", dataISO: "2026-07-28", hora: "15:00", resp: "BA" },
];

export const contratos = [
  { id: 1, cliente: "Metalúrgica Ferro Sul", valor: "R$ 64.000", parcelas: "6x", status: "Em dia", proximoVenc: "25/07" },
  { id: 2, cliente: "TechFlow Sistemas", valor: "R$ 45.000", parcelas: "4x", status: "Em dia", proximoVenc: "28/07" },
  { id: 3, cliente: "Grupo Alvorada", valor: "R$ 38.000", parcelas: "8x", status: "Em dia", proximoVenc: "30/07" },
  { id: 4, cliente: "Vale Verde Comércio", valor: "R$ 9.500", parcelas: "3x", status: "Inadimplente", proximoVenc: "12/07" },
  { id: 5, cliente: "Padaria Trigo Dourado", valor: "R$ 12.000", parcelas: "4x", status: "Em dia", proximoVenc: "22/07" },
];

export const financeiroKpis = [
  { label: "Recebido no mês", value: "R$ 168 mil" },
  { label: "A receber", value: "R$ 79 mil" },
  { label: "Inadimplência", value: "R$ 9,5 mil" },
  { label: "Ticket médio", value: "R$ 33,7 mil" },
];

export const relatoriosGerados = [
  { id: 1, nome: "Diagnóstico Empresarial — Grupo Alvorada", tipo: "Diagnóstico", data: "10/07/2026" },
  { id: 2, nome: "Plano de Trabalho — Metalúrgica Ferro Sul", tipo: "Plano de Trabalho", data: "08/07/2026" },
  { id: 3, nome: "Relatório de Visita — Padaria Trigo Dourado", tipo: "Visita", data: "15/07/2026" },
  { id: 4, nome: "Resumo Executivo — Nova Era Logística", tipo: "Resumo Executivo", data: "14/07/2026" },
  { id: 5, nome: "Indicadores Comparativos — TechFlow Sistemas", tipo: "Indicadores", data: "05/07/2026" },
];

export const automacoesRegras = [
  { id: 1, nome: "Gerar tarefas após diagnóstico concluído", gatilho: "Diagnóstico concluído", ativa: true },
  { id: 2, nome: "Lembrete de parcela a vencer (3 dias antes)", gatilho: "Vencimento de parcela", ativa: true },
  { id: 3, nome: "Alertar consultor sobre pendências", gatilho: "Tarefa atrasada", ativa: true },
  { id: 4, nome: "Notificar cliente sobre nova atividade", gatilho: "Nova tarefa no plano", ativa: false },
  { id: 5, nome: "Avisar sobre contrato próximo do vencimento", gatilho: "30 dias antes do fim do contrato", ativa: true },
];
export const diagnosticoAreas = [
  { area: "Financeiro", nota: 7.5 },
  { area: "RH", nota: 6.0 },
  { area: "Marketing", nota: 5.5 },
  { area: "Comercial", nota: 8.0 },
  { area: "Produção", nota: 6.8 },
  { area: "Fiscal", nota: 7.0 },
  { area: "Compras", nota: 6.2 },
  { area: "Estoque", nota: 5.9 },
  { area: "Gestão", nota: 7.8 },
];

export const areasDiagnostico = [
  {
    area: "Financeiro",
    perguntas: [
      "A empresa possui fluxo de caixa atualizado semanalmente?",
      "Existe separação clara entre finanças pessoais e da empresa?",
      "Há controle de custos fixos e variáveis por centro de custo?",
    ],
  },
  {
    area: "Recursos Humanos",
    perguntas: [
      "Existe um processo estruturado de contratação?",
      "Há avaliação de desempenho periódica da equipe?",
      "A empresa possui plano de cargos e salários definido?",
    ],
  },
  {
    area: "Marketing",
    perguntas: [
      "A empresa possui posicionamento de marca definido?",
      "Existe um plano de marketing com metas mensuráveis?",
      "Há acompanhamento de CAC e ROI das campanhas?",
    ],
  },
  {
    area: "Comercial",
    perguntas: [
      "Existe um funil de vendas estruturado e acompanhado?",
      "A equipe comercial possui metas claras e comissionamento definido?",
      "Há CRM ou ferramenta de gestão de oportunidades em uso?",
    ],
  },
  {
    area: "Produção",
    perguntas: [
      "A capacidade produtiva é monitorada e planejada?",
      "Existe controle de qualidade formalizado?",
      "Os processos produtivos estão documentados?",
    ],
  },
  {
    area: "Fiscal",
    perguntas: [
      "O regime tributário atual é revisado periodicamente?",
      "A empresa está em dia com obrigações acessórias?",
      "Há planejamento tributário ativo?",
    ],
  },
  {
    area: "Compras",
    perguntas: [
      "Existe processo de cotação com múltiplos fornecedores?",
      "Há política de prazos e condições de pagamento definida?",
      "O histórico de fornecedores é avaliado periodicamente?",
    ],
  },
  {
    area: "Estoque",
    perguntas: [
      "Existe controle de estoque em tempo real?",
      "Há giro de estoque calculado e monitorado?",
      "O ponto de reposição é definido por produto?",
    ],
  },
  {
    area: "Gestão",
    perguntas: [
      "A empresa possui planejamento estratégico formalizado?",
      "Existem reuniões de acompanhamento de indicadores?",
      "Há sucessão e governança definidas para o negócio?",
    ],
  },
];

export const diagnosticosDetalhe: Record<number, {
  pontosFortes: string[];
  oportunidadesMelhoria: string[];
  resumoExecutivo: string;
}> = {
  1: {
    pontosFortes: ["Área Comercial estruturada e com metas claras", "Gestão com boa governança"],
    oportunidadesMelhoria: ["Marketing sem plano formalizado", "Estoque sem ponto de reposição definido"],
    resumoExecutivo:
      "O Grupo Alvorada apresenta maturidade acima da média em Comercial e Gestão, mas precisa estruturar Marketing e Estoque para sustentar o crescimento projetado nos próximos 12 meses.",
  },
  2: {
    pontosFortes: ["Processos produtivos documentados", "Controle fiscal em dia"],
    oportunidadesMelhoria: ["RH sem avaliação de desempenho", "Compras sem cotação estruturada"],
    resumoExecutivo:
      "A Metalúrgica Ferro Sul tem base operacional sólida, com oportunidade de ganho rápido ao formalizar RH e o processo de compras.",
  },
};

export const clientesDetalhe: Record<number, {
  razaoSocial: string;
  cnpj: string;
  porte: string;
  funcionarios: number;
  endereco: string;
  contatos: { nome: string; cargo: string; telefone: string; email: string; principal: boolean }[];
  atividades: { titulo: string; data: string }[];
}> = {
  1: {
    razaoSocial: "Ferro Sul Metalúrgica Ltda.",
    cnpj: "12.345.678/0001-90",
    porte: "Médio porte",
    funcionarios: 84,
    endereco: "Av. das Indústrias, 1200 — Recife/PE",
    contatos: [
      { nome: "Marcelo Andrade", cargo: "Diretor Industrial", telefone: "(81) 99123-4567", email: "marcelo@ferrosul.com.br", principal: true },
      { nome: "Fernanda Lima", cargo: "Gerente Financeira", telefone: "(81) 99876-5432", email: "fernanda@ferrosul.com.br", principal: false },
    ],
    atividades: [
      { titulo: "Contrato assinado", data: "05/07/2026" },
      { titulo: "Diagnóstico concluído", data: "05/07/2026" },
      { titulo: "Visita técnica registrada", data: "12/07/2026" },
    ],
  },
  2: {
    razaoSocial: "TechFlow Sistemas de Gestão Ltda.",
    cnpj: "23.456.789/0001-11",
    porte: "Pequeno porte",
    funcionarios: 22,
    endereco: "Rua da Inovação, 450 — São Paulo/SP",
    contatos: [
      { nome: "Bruna Alencar", cargo: "CEO", telefone: "(11) 98888-1234", email: "bruna@techflow.com.br", principal: true },
    ],
    atividades: [
      { titulo: "Contrato assinado", data: "10/07/2026" },
      { titulo: "Diagnóstico em preenchimento", data: "16/07/2026" },
    ],
  },
};

export const oportunidadesDetalhe: Record<number, {
  telefone: string;
  email: string;
  origem: string;
  observacoes: string;
  atividades: { tipo: string; descricao: string; data: string }[];
}> = {
  8: {
    telefone: "(81) 99222-3344",
    email: "contato@construtorahorizonte.com.br",
    origem: "Indicação de cliente",
    observacoes: "Empresa em fase de expansão para dois novos estados, buscando estruturar governança antes do crescimento.",
    atividades: [
      { tipo: "Ligação", descricao: "Primeiro contato, levantamento de dores", data: "08/07/2026" },
      { tipo: "Reunião", descricao: "Apresentação institucional da Ninho", data: "12/07/2026" },
      { tipo: "Proposta", descricao: "Envio da proposta comercial", data: "15/07/2026" },
    ],
  },
  9: {
    telefone: "(11) 98888-1234",
    email: "bruna@techflow.com.br",
    origem: "Site — formulário de contato",
    observacoes: "Startup em crescimento acelerado, precisa de estrutura financeira antes da próxima rodada de investimento.",
    atividades: [
      { tipo: "Reunião", descricao: "Diagnóstico preliminar realizado", data: "01/07/2026" },
      { tipo: "Contrato", descricao: "Contrato enviado para assinatura", data: "09/07/2026" },
    ],
  },
};
