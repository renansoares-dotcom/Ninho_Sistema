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
