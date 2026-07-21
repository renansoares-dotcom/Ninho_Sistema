import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enviarEmail, emailBase } from "@/lib/email";

// Rota pública (sem login) que alimenta o formulário de Diagnóstico Público
// (lead magnet). Propositalmente NÃO usa o cliente autenticado do navegador
// — usa a service role key no servidor, então não precisamos abrir nenhuma
// policy de RLS pra tráfego anônimo da internet em tabelas sensíveis.

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, nome")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ error: "Configuração indisponível." }, { status: 500 });
  }

  const { data: perguntas } = await supabase
    .from("diagnostico_publico_perguntas")
    .select("id, texto, peso")
    .eq("tenant_id", tenant.id)
    .eq("ativa", true)
    .order("ordem", { ascending: true });

  const { data: configuracoes } = await supabase
    .from("configuracoes_empresa")
    .select("logo_url")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  return NextResponse.json({ empresa: tenant.nome, logoUrl: configuracoes?.logo_url ?? null, perguntas: perguntas ?? [] });
}

type RespostaEnviada = { id: string; resposta: number };

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { nome, email, celular, respostas, empresa_honeypot } = body as {
    nome?: string;
    email?: string;
    celular?: string;
    respostas?: RespostaEnviada[];
    empresa_honeypot?: string;
  };

  // Honeypot: campo invisível pra humanos, só bots preenchem.
  if (empresa_honeypot) {
    return NextResponse.json({ nota: 0, mensagem: "Recebido." });
  }

  if (!nome?.trim() || !email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Preencha nome e um e-mail válido." }, { status: 400 });
  }

  if (!Array.isArray(respostas) || respostas.length === 0) {
    return NextResponse.json({ error: "Respostas ausentes." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ error: "Configuração indisponível." }, { status: 500 });
  }

  // Evita reenvio duplicado do mesmo e-mail nas últimas 24h.
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existente } = await supabase
    .from("diagnosticos_publicos")
    .select("nota")
    .eq("tenant_id", tenant.id)
    .eq("email", email.trim().toLowerCase())
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) {
    return NextResponse.json({ nota: existente.nota, mensagem: "Você já enviou esse diagnóstico hoje." });
  }

  // Nunca confia no peso mandado pelo navegador — busca de novo no banco.
  const idsRecebidos = respostas.map((r) => r.id);
  const { data: perguntasBanco } = await supabase
    .from("diagnostico_publico_perguntas")
    .select("id, texto, peso")
    .eq("tenant_id", tenant.id)
    .in("id", idsRecebidos);

  if (!perguntasBanco || perguntasBanco.length === 0) {
    return NextResponse.json({ error: "Perguntas inválidas." }, { status: 400 });
  }

  let notaTotal = 0;
  const respostasCompletas = perguntasBanco.map((p) => {
    const enviado = respostas.find((r) => r.id === p.id);
    const valor = Math.min(10, Math.max(0, Number(enviado?.resposta ?? 0)));
    notaTotal += (valor / 10) * Number(p.peso);
    return { pergunta_id: p.id, texto: p.texto, peso: p.peso, resposta: valor };
  });
  notaTotal = Math.round(notaTotal * 10) / 10;

  const { error } = await supabase.from("diagnosticos_publicos").insert({
    tenant_id: tenant.id,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    celular: celular?.trim() || null,
    respostas: respostasCompletas,
    nota: notaTotal,
    status: "Novo",
  });

  if (error) {
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente." }, { status: 500 });
  }

  // Avisa a gestão por e-mail (best-effort — não bloqueia a resposta pro
  // visitante se o e-mail falhar ou não estiver configurado).
  const { data: gestao } = await supabase
    .from("profiles")
    .select("email")
    .eq("tenant_id", tenant.id)
    .eq("ativo", true)
    .in("role", ["admin", "diretor"]);
  const emailsGestao = (gestao ?? []).map((g) => g.email).filter(Boolean);
  if (emailsGestao.length > 0) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    enviarEmail({
      para: emailsGestao,
      assunto: `Novo diagnóstico público recebido — ${nome.trim()} (nota ${notaTotal})`,
      html: emailBase({
        titulo: "Novo diagnóstico público recebido",
        corpo: `${nome.trim()} (${email.trim()}${celular ? `, ${celular.trim()}` : ""}) preencheu o diagnóstico público com nota ${notaTotal}/10. Revise e decida se vale importar como lead.`,
        cta: { texto: "Ver diagnósticos recebidos", url: `${siteUrl}/diagnostico` },
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ nota: notaTotal, mensagem: "Diagnóstico recebido com sucesso." });
}
