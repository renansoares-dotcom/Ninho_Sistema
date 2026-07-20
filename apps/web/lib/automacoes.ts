import { supabase } from "./supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

async function regraAtiva(gatilho: string): Promise<boolean> {
  const { data } = await supabase
    .from("automacoes_regras")
    .select("ativa")
    .eq("tenant_id", TENANT_ID)
    .eq("gatilho", gatilho)
    .maybeSingle();
  return data?.ativa ?? false;
}

async function jaNotificado(link: string, titulo: string): Promise<boolean> {
  const { data } = await supabase
    .from("notificacoes")
    .select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("link", link)
    .eq("titulo", titulo)
    .maybeSingle();
  return !!data;
}

/**
 * Verifica parcelas com vencimento nos próximos 3 dias e cria notificação
 * caso ainda não exista uma para aquela parcela.
 */
export async function verificarParcelasVencendo() {
  if (!(await regraAtiva("parcela_vencendo"))) return;

  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + 3);

  const { data: parcelas } = await supabase
    .from("contrato_parcelas")
    .select("id, vencimento, valor, contrato_id, contratos(cliente_id, clientes(nome_fantasia, razao_social))")
    .eq("status", "Pendente")
    .gte("vencimento", hoje.toISOString().slice(0, 10))
    .lte("vencimento", limite.toISOString().slice(0, 10));

  for (const p of parcelas ?? []) {
    const nomeCliente =
      (p as any).contratos?.clientes?.nome_fantasia ??
      (p as any).contratos?.clientes?.razao_social ??
      "Cliente";
    const titulo = `Parcela de ${nomeCliente} vence em breve (${new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")})`;

    if (await jaNotificado("/financeiro", titulo)) continue;

    await supabase.from("notificacoes").insert({
      tenant_id: TENANT_ID,
      tipo: "financeiro",
      titulo,
      link: "/financeiro",
    });
  }
}

/**
 * Verifica tarefas do Kanban com prazo vencido e ainda não concluídas.
 */
export async function verificarTarefasAtrasadas() {
  if (!(await regraAtiva("tarefa_atrasada"))) return;

  const hoje = new Date().toISOString().slice(0, 10);

  const { data: tarefas } = await supabase
    .from("tarefas")
    .select("id, titulo, data_conclusao, coluna")
    .lt("data_conclusao", hoje)
    .neq("coluna", "concluido");

  for (const t of tarefas ?? []) {
    const titulo = `Tarefa atrasada: "${t.titulo}"`;
    if (await jaNotificado("/kanban", titulo)) continue;

    await supabase.from("notificacoes").insert({
      tenant_id: TENANT_ID,
      tipo: "kanban",
      titulo,
      link: "/kanban",
    });
  }
}

/**
 * Chamada quando um diagnóstico é concluído: cria automaticamente uma
 * tarefa de revisão no Kanban, se a regra estiver ativa.
 */
export async function gerarTarefaAposDiagnostico(clienteId: string, clienteNome: string) {
  if (!(await regraAtiva("diagnostico_concluido"))) return;

  await supabase.from("tarefas").insert({
    tenant_id: TENANT_ID,
    cliente_id: clienteId,
    titulo: `Revisar diagnóstico concluído — ${clienteNome}`,
    coluna: "afazer",
    prioridade: "Alta",
  });

  await supabase.from("notificacoes").insert({
    tenant_id: TENANT_ID,
    tipo: "diagnostico",
    titulo: `Diagnóstico de ${clienteNome} concluído — tarefa de revisão criada`,
    link: "/kanban",
  });
}

/** Roda todas as verificações "de checagem periódica" de uma vez. */
export async function rodarVerificacoesAutomaticas() {
  await Promise.all([verificarParcelasVencendo(), verificarTarefasAtrasadas()]);
}
