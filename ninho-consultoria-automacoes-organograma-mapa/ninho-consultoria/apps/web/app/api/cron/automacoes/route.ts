import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Rota chamada pelo Vercel Cron (ver vercel.json) — roda as verificações
// periódicas de automação (parcela vencendo, contrato vencendo, tarefa
// atrasada) de verdade, sem depender de alguém abrir o Dashboard.
//
// Usa a service role key porque não existe usuário logado num cron job;
// itera por todos os tenants (já preparado pro multi-tenant futuro).

function protegida(request: NextRequest) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

async function jaNotificado(supabase: ReturnType<typeof createSupabaseAdminClient>, tenantId: string, link: string, titulo: string) {
  const { data } = await supabase
    .from("notificacoes")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("link", link)
    .eq("titulo", titulo)
    .maybeSingle();
  return !!data;
}

async function notificarVarios(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  tenantId: string,
  destinatarios: string[],
  tipo: string,
  titulo: string,
  link: string
) {
  if (destinatarios.length === 0) return;
  await supabase
    .from("notificacoes")
    .insert(destinatarios.map((profile_id) => ({ tenant_id: tenantId, profile_id, tipo, titulo, link })));
}

export async function GET(request: NextRequest) {
  if (!protegida(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const resultado: Record<string, number> = { parcelas: 0, contratos: 0, tarefas: 0 };

  const { data: tenants } = await supabase.from("tenants").select("id");

  for (const tenant of tenants ?? []) {
    const { data: regras } = await supabase
      .from("automacoes_regras")
      .select("gatilho, ativa")
      .eq("tenant_id", tenant.id);
    const ativa = (gatilho: string) => regras?.find((r) => r.gatilho === gatilho)?.ativa ?? false;

    const { data: financeiro } = await supabase
      .from("profiles")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("ativo", true)
      .in("role", ["admin", "diretor", "financeiro"]);
    const { data: gestao } = await supabase
      .from("profiles")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("ativo", true)
      .in("role", ["admin", "diretor"]);
    const idsFinanceiro = (financeiro ?? []).map((p) => p.id);
    const idsGestao = (gestao ?? []).map((p) => p.id);

    // Parcelas vencendo em até 3 dias
    if (ativa("parcela_vencendo")) {
      const hoje = new Date();
      const limite = new Date();
      limite.setDate(limite.getDate() + 3);
      const { data: parcelas } = await supabase
        .from("contrato_parcelas")
        .select("vencimento, contratos!inner(tenant_id, clientes(nome_fantasia, razao_social))")
        .eq("status", "Pendente")
        .eq("contratos.tenant_id", tenant.id)
        .gte("vencimento", hoje.toISOString().slice(0, 10))
        .lte("vencimento", limite.toISOString().slice(0, 10));

      for (const p of parcelas ?? []) {
        const nomeCliente = (p as any).contratos?.clientes?.nome_fantasia ?? (p as any).contratos?.clientes?.razao_social ?? "Cliente";
        const titulo = `Parcela de ${nomeCliente} vence em breve (${new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")})`;
        if (await jaNotificado(supabase, tenant.id, "/financeiro", titulo)) continue;
        await notificarVarios(supabase, tenant.id, idsFinanceiro, "financeiro", titulo, "/financeiro");
        resultado.parcelas++;
      }
    }

    // Contratos vencendo em até 15 dias
    if (ativa("contrato_vencendo")) {
      const hoje = new Date();
      const limite = new Date();
      limite.setDate(limite.getDate() + 15);
      const { data: contratos } = await supabase
        .from("contratos")
        .select("data_fim, clientes(nome_fantasia, razao_social)")
        .eq("tenant_id", tenant.id)
        .eq("status", "Ativo")
        .not("data_fim", "is", null)
        .gte("data_fim", hoje.toISOString().slice(0, 10))
        .lte("data_fim", limite.toISOString().slice(0, 10));

      for (const c of contratos ?? []) {
        const nomeCliente = (c as any).clientes?.nome_fantasia ?? (c as any).clientes?.razao_social ?? "Cliente";
        const titulo = `Contrato de ${nomeCliente} vence em ${new Date(c.data_fim + "T12:00:00").toLocaleDateString("pt-BR")}`;
        if (await jaNotificado(supabase, tenant.id, "/faturamento", titulo)) continue;
        await notificarVarios(supabase, tenant.id, idsFinanceiro, "financeiro", titulo, "/faturamento");
        resultado.contratos++;
      }
    }

    // Tarefas atrasadas
    if (ativa("tarefa_atrasada")) {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data: tarefas } = await supabase
        .from("tarefas")
        .select("titulo, responsavel_id")
        .eq("tenant_id", tenant.id)
        .lt("data_conclusao", hoje)
        .neq("coluna", "concluido");

      for (const t of tarefas ?? []) {
        const titulo = `Tarefa atrasada: "${t.titulo}"`;
        if (await jaNotificado(supabase, tenant.id, "/kanban", titulo)) continue;
        const destinatarios = t.responsavel_id ? [t.responsavel_id, ...idsGestao] : idsGestao;
        await notificarVarios(supabase, tenant.id, [...new Set(destinatarios)], "kanban", titulo, "/kanban");
        resultado.tarefas++;
      }
    }
  }

  return NextResponse.json({ ok: true, notificacoesCriadas: resultado });
}
