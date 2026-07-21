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

/** Admin/Diretor do tenant — usados como destinatário padrão de alertas gerenciais. */
async function destinatariosGestao(): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("ativo", true)
    .in("role", ["admin", "diretor"]);
  return (data ?? []).map((p) => p.id);
}

/** Admin/Diretor/Financeiro — usados em alertas de dinheiro (parcela, contrato). */
async function destinatariosFinanceiro(): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("ativo", true)
    .in("role", ["admin", "diretor", "financeiro"]);
  return (data ?? []).map((p) => p.id);
}

async function notificarVarios(destinatarios: string[], tipo: string, titulo: string, link: string) {
  if (destinatarios.length === 0) return;
  await supabase.from("notificacoes").insert(
    destinatarios.map((profile_id) => ({ tenant_id: TENANT_ID, profile_id, tipo, titulo, link }))
  );
}

/**
 * Verifica parcelas com vencimento nos próximos 3 dias e notifica o time
 * financeiro (Admin/Diretor/Financeiro), caso ainda não tenha sido avisado.
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

  if (!parcelas || parcelas.length === 0) return;
  const destinatarios = await destinatariosFinanceiro();

  for (const p of parcelas) {
    const nomeCliente =
      (p as any).contratos?.clientes?.nome_fantasia ??
      (p as any).contratos?.clientes?.razao_social ??
      "Cliente";
    const titulo = `Parcela de ${nomeCliente} vence em breve (${new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")})`;

    if (await jaNotificado("/financeiro", titulo)) continue;
    await notificarVarios(destinatarios, "financeiro", titulo, "/financeiro");
  }
}

/**
 * Verifica contratos ativos com data de término nos próximos 15 dias e
 * notifica o time financeiro — dá tempo de negociar renovação.
 */
export async function verificarContratosVencendo() {
  if (!(await regraAtiva("contrato_vencendo"))) return;

  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + 15);

  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, data_fim, cliente_id, clientes(nome_fantasia, razao_social)")
    .eq("status", "Ativo")
    .not("data_fim", "is", null)
    .gte("data_fim", hoje.toISOString().slice(0, 10))
    .lte("data_fim", limite.toISOString().slice(0, 10));

  if (!contratos || contratos.length === 0) return;
  const destinatarios = await destinatariosFinanceiro();

  for (const c of contratos) {
    const nomeCliente = (c as any).clientes?.nome_fantasia ?? (c as any).clientes?.razao_social ?? "Cliente";
    const titulo = `Contrato de ${nomeCliente} vence em ${new Date(c.data_fim + "T12:00:00").toLocaleDateString("pt-BR")}`;

    if (await jaNotificado("/faturamento", titulo)) continue;
    await notificarVarios(destinatarios, "financeiro", titulo, "/faturamento");
  }
}

/**
 * Verifica tarefas do Kanban com prazo vencido e ainda não concluídas.
 * Notifica o responsável pela tarefa, se houver; senão, cai na gestão.
 */
export async function verificarTarefasAtrasadas() {
  if (!(await regraAtiva("tarefa_atrasada"))) return;

  const hoje = new Date().toISOString().slice(0, 10);

  const { data: tarefas } = await supabase
    .from("tarefas")
    .select("id, titulo, data_conclusao, coluna, responsavel_id")
    .lt("data_conclusao", hoje)
    .neq("coluna", "concluido");

  if (!tarefas || tarefas.length === 0) return;
  const gestao = await destinatariosGestao();

  for (const t of tarefas) {
    const titulo = `Tarefa atrasada: "${t.titulo}"`;
    if (await jaNotificado("/kanban", titulo)) continue;

    const destinatarios = t.responsavel_id ? [t.responsavel_id, ...gestao] : gestao;
    await notificarVarios([...new Set(destinatarios)], "kanban", titulo, "/kanban");
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

  const destinatarios = await destinatariosGestao();
  await notificarVarios(
    destinatarios,
    "diagnostico",
    `Diagnóstico de ${clienteNome} concluído — tarefa de revisão criada`,
    "/kanban"
  );
}

/**
 * Chamada ao registrar uma nova atividade (ligação, e-mail, reunião) numa
 * oportunidade do CRM. Notifica a gestão pra acompanhar o andamento.
 */
export async function notificarNovaAtividadeCliente(empresaNome: string, tipoAtividade: string, oportunidadeId: string) {
  if (!(await regraAtiva("nova_atividade_cliente"))) return;

  const destinatarios = await destinatariosGestao();
  await notificarVarios(
    destinatarios,
    "crm",
    `Nova atividade (${tipoAtividade}) registrada para ${empresaNome}`,
    `/crm/${oportunidadeId}`
  );
}

/** Roda todas as verificações "de checagem periódica" de uma vez. */
export async function rodarVerificacoesAutomaticas() {
  await Promise.all([verificarParcelasVencendo(), verificarTarefasAtrasadas(), verificarContratosVencendo()]);
}
