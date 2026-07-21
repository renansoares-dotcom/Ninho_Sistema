import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enviarEmail, emailBase } from "@/lib/email";

// Chamada pelo componente de Mensagens (Portal ou Workspace interno) logo
// depois de uma mensagem ser salva no banco. A notificação DENTRO do app
// já é criada por um gatilho no Postgres (migration 031) — essa rota cuida
// só do e-mail, que precisa da service role key pra descobrir e-mails de
// destinatário sem esbarrar em RLS.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const clienteId = body?.clienteId as string | undefined;
  const autorId = body?.autorId as string | undefined;

  if (!clienteId || !autorId) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: autor } = await supabase.from("profiles").select("role").eq("id", autorId).maybeSingle();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, tenant_id, responsavel_id, nome_fantasia, razao_social")
    .eq("id", clienteId)
    .maybeSingle();

  if (!autor || !cliente) {
    return NextResponse.json({ ok: true }); // nada pra notificar, mas não é erro do cliente
  }

  const nomeEmpresa = cliente.nome_fantasia || cliente.razao_social;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let destinatarios: { email: string }[] = [];
  let assunto = "";
  let titulo = "";
  let corpo = "";
  let ctaTexto = "";
  let ctaUrl = "";

  if (autor.role === "cliente") {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("tenant_id", cliente.tenant_id)
      .eq("ativo", true)
      .in("role", ["admin", "diretor"]);
    const { data: responsavel } = cliente.responsavel_id
      ? await supabase.from("profiles").select("email").eq("id", cliente.responsavel_id).maybeSingle()
      : { data: null };

    destinatarios = [...(data ?? []), ...(responsavel ? [responsavel] : [])];
    assunto = `Nova mensagem de ${nomeEmpresa}`;
    titulo = "Nova mensagem no Portal do Cliente";
    corpo = `${nomeEmpresa} acabou de mandar uma mensagem pelo Portal do Cliente. Entre no sistema pra ver e responder.`;
    ctaTexto = "Ver mensagem";
    ctaUrl = `${siteUrl}/clientes/${cliente.id}`;
  } else {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("tenant_id", cliente.tenant_id)
      .eq("ativo", true)
      .eq("role", "cliente")
      .eq("cliente_id", cliente.id);

    destinatarios = data ?? [];
    assunto = "Nova mensagem da sua consultoria";
    titulo = "Nova mensagem da sua consultoria";
    corpo = "Sua consultoria acabou de responder no Portal do Cliente. Entre pra ver a mensagem.";
    ctaTexto = "Ver mensagem";
    ctaUrl = `${siteUrl}/portal/mensagens`;
  }

  const emails = destinatarios.map((d) => d.email).filter(Boolean);
  if (emails.length === 0) return NextResponse.json({ ok: true, enviados: 0 });

  const resultado = await enviarEmail({
    para: emails,
    assunto,
    html: emailBase({ titulo, corpo, cta: { texto: ctaTexto, url: ctaUrl } }),
  });

  return NextResponse.json({ ok: true, ...resultado });
}
