"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EstadoAuth = { erro?: string } | undefined;

export async function entrar(_estado: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const proximo = String(formData.get("proximo") || "/dashboard");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (erroLogin) {
    if (erroLogin.message.includes("Invalid login credentials")) {
      return { erro: "E-mail ou senha incorretos." };
    }
    if (erroLogin.message.includes("Email not confirmed")) {
      return { erro: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada." };
    }
    return { erro: "Não foi possível entrar. Tente novamente em instantes." };
  }

  // Escritório (tenant) suspenso pelo super admin não pode acessar, mesmo
  // com e-mail/senha corretos.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: perfil } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
    if (perfil?.tenant_id) {
      const { data: tenant } = await supabase.from("tenants").select("ativo").eq("id", perfil.tenant_id).maybeSingle();
      if (tenant && !tenant.ativo) {
        await supabase.auth.signOut();
        return { erro: "O acesso da sua consultoria está temporariamente suspenso. Fale com o suporte." };
      }
    }
  }

  revalidatePath("/", "layout");
  redirect(proximo || "/dashboard");
}

export async function sair() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// Login exclusivo do Super Admin — usa uma conta separada (e-mail/senha
// próprios, sem relação com nenhum escritório). Depois de autenticar,
// confere se essa conta está na tabela super_admins; se não estiver,
// desloga na hora e nem revela se a senha "quase" funcionou.
export async function entrarSuperAdmin(_estado: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: erroLogin } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (erroLogin) {
    return { erro: "E-mail ou senha incorretos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: souSuperAdmin } = user
    ? await supabase.from("super_admins").select("id").eq("id", user.id).maybeSingle()
    : { data: null };

  if (!souSuperAdmin) {
    await supabase.auth.signOut();
    return { erro: "E-mail ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function solicitarRedefinicaoSenha(
  _estado: EstadoAuth,
  formData: FormData
): Promise<{ erro?: string; enviado?: boolean }> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { erro: "Informe seu e-mail." };

  const supabase = await createSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/redefinir-senha`,
  });

  // Por segurança, não revelamos se o e-mail existe ou não na base.
  if (error) return { erro: "Não foi possível enviar o e-mail agora. Tente novamente em instantes." };
  return { enviado: true };
}

export async function redefinirSenha(
  _estado: EstadoAuth,
  formData: FormData
): Promise<EstadoAuth> {
  const novaSenha = String(formData.get("senha") || "");
  const confirmacao = String(formData.get("confirmacao") || "");

  if (novaSenha.length < 8) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (novaSenha !== confirmacao) {
    return { erro: "As senhas não coincidem." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    return { erro: "Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo." };
  }

  redirect("/login");
}
