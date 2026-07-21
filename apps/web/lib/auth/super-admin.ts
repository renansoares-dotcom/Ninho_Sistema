import { createSupabaseServerClient } from "@/lib/supabase/server";

// Confere se a pessoa logada é super admin (plataforma inteira, cruzando
// todos os tenants) — não tem relação com o role dentro de um tenant
// específico (profiles.role). São dois níveis de permissão diferentes.
export async function exigirSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("super_admins").select("id").eq("id", user.id).maybeSingle();
  return data ? user : null;
}
