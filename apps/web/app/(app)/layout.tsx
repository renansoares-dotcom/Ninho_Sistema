import { redirect } from "next/navigation";
import TopNav from "@/components/shared/TopNav";
import { ProfileProvider, type Profile } from "@/components/shared/ProfileProvider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // O middleware já bloqueia usuários sem sessão antes de chegar aqui, mas
  // fazemos a checagem de novo — layouts de servidor não devem confiar
  // cegamente em outra camada para segurança.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, email, role, avatar_url, tenant_id, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Usuário existe no Supabase Auth mas ainda não tem um registro em
    // "profiles" (gatilho de provisionamento não rodou, ou foi apagado).
    redirect("/login?erro=sem_perfil");
  }

  if (!profile.ativo) {
    redirect("/login?erro=inativo");
  }

  if (profile.role === "cliente") {
    redirect("/portal");
  }

  return (
    <ProfileProvider profile={profile as Profile}>
      <div className="min-h-screen bg-background">
        <TopNav />
        {children}
      </div>
    </ProfileProvider>
  );
}
