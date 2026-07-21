import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const AUTOMACOES_PADRAO = ["diagnostico_concluido", "parcela_vencendo", "contrato_vencendo", "tarefa_atrasada", "nova_atividade_cliente"];

const PERGUNTAS_PADRAO = [
  { texto: "A empresa tem controle de fluxo de caixa atualizado?", peso: 2, ordem: 1 },
  { texto: "Existe separação entre finanças pessoais e da empresa?", peso: 1, ordem: 2 },
  { texto: "Há metas comerciais claras e acompanhadas?", peso: 1, ordem: 3 },
  { texto: "A empresa tem processos documentados (não depende só de uma pessoa)?", peso: 2, ordem: 4 },
  { texto: "Existe planejamento tributário ativo?", peso: 1, ordem: 5 },
  { texto: "A equipe tem indicadores de desempenho definidos?", peso: 1, ordem: 6 },
  { texto: "Existe um plano estratégico para os próximos 12 meses?", peso: 2, ordem: 7 },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  // 1. Confirma que quem está chamando é super admin de verdade
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: souSuperAdmin } = await supabaseAuth.from("super_admins").select("id").eq("id", user.id).maybeSingle();
  if (!souSuperAdmin) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { nomeEscritorio, slug, nomeAdmin, emailAdmin, senhaAdmin } = body ?? {};

  if (!nomeEscritorio?.trim() || !nomeAdmin?.trim() || !emailAdmin?.trim() || !senhaAdmin || senhaAdmin.length < 8) {
    return NextResponse.json({ error: "Preencha todos os campos (senha com pelo menos 8 caracteres)." }, { status: 400 });
  }

  const slugFinal = slugify(slug?.trim() || nomeEscritorio);
  const admin = createSupabaseAdminClient();

  // 2. Checa se o slug já existe
  const { data: slugExistente } = await admin.from("tenants").select("id").eq("slug", slugFinal).maybeSingle();
  if (slugExistente) {
    return NextResponse.json({ error: `O endereço "${slugFinal}" já está em uso por outro escritório.` }, { status: 400 });
  }

  // 3. Cria o tenant
  const { data: tenant, error: erroTenant } = await admin
    .from("tenants")
    .insert({ nome: nomeEscritorio.trim(), slug: slugFinal, ativo: true })
    .select("id")
    .single();
  if (erroTenant || !tenant) {
    return NextResponse.json({ error: "Não foi possível criar o escritório." }, { status: 500 });
  }

  // 4. Semeia os dados padrão
  await Promise.all([
    admin.from("configuracoes_empresa").insert({ tenant_id: tenant.id, razao_social: nomeEscritorio.trim(), nome_fantasia: nomeEscritorio.trim() }),
    admin.from("tenant_assinaturas").insert({ tenant_id: tenant.id }),
    admin.from("automacoes_regras").insert(AUTOMACOES_PADRAO.map((gatilho) => ({ tenant_id: tenant.id, gatilho, ativa: false }))),
    admin.from("diagnostico_publico_perguntas").insert(PERGUNTAS_PADRAO.map((p) => ({ tenant_id: tenant.id, ...p }))),
  ]);

  // 5. Cria o primeiro usuário Admin — o gatilho handle_new_user já cria o
  // profile automaticamente, lendo o tenant_id do metadata abaixo.
  const { data: novoUsuario, error: erroUsuario } = await admin.auth.admin.createUser({
    email: emailAdmin.trim(),
    password: senhaAdmin,
    email_confirm: true,
    user_metadata: { nome: nomeAdmin.trim(), role: "admin", tenant_id: tenant.id },
  });

  if (erroUsuario || !novoUsuario.user) {
    // O tenant já foi criado; melhor devolver o erro específico do usuário
    // pra você decidir se corrige o e-mail e tenta de novo, ou apaga o tenant.
    return NextResponse.json(
      { error: `Escritório criado, mas o usuário admin falhou: ${erroUsuario?.message ?? "erro desconhecido"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, tenantId: tenant.id, slug: slugFinal });
}
