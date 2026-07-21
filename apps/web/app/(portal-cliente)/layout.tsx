import { redirect } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sair } from "@/lib/auth/actions";
import { PortalProvider } from "@/components/portal/PortalContext";
import PortalNav from "@/components/portal/PortalNav";
import NotificationsBell from "@/components/shared/NotificationsBell";

export default async function PortalClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, role, cliente_id, tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  // Só o perfil "cliente" usa o Portal. Equipe interna que cair aqui por
  // engano volta para a área de trabalho normal.
  if (!profile || profile.role !== "cliente") {
    redirect("/dashboard");
  }

  let clienteNome: string | null = null;
  if (profile.cliente_id) {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("nome_fantasia, razao_social")
      .eq("id", profile.cliente_id)
      .maybeSingle();
    clienteNome = cliente?.nome_fantasia || cliente?.razao_social || null;
  }

  const { data: configuracoes } = await supabase
    .from("configuracoes_empresa")
    .select("logo_url")
    .eq("tenant_id", profile.tenant_id)
    .maybeSingle();
  const logoUrl = configuracoes?.logo_url ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-[#eef0f2] bg-white sticky top-0 z-20">
        <div className="max-w-[1100px] mx-auto px-7 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-8 w-auto max-w-[140px] object-contain" />
            ) : (
              <Image src="/logo.png" alt="Ninho Consultoria" width={110} height={45} className="h-8 w-auto" priority />
            )}
            {profile.cliente_id && <PortalNav />}
          </div>
          <div className="flex items-center gap-4">
            {profile.cliente_id && <NotificationsBell />}
            <span className="text-[13px] text-[#5b6270] hidden sm:inline">Olá, {profile.nome.split(" ")[0]}</span>
            <form action={sair}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#767c88] hover:text-[#f04438]"
              >
                <LogOut size={15} /> Sair
              </button>
            </form>
          </div>
        </div>
      </div>

      {!profile.cliente_id || !clienteNome ? (
        <div className="max-w-[1100px] mx-auto px-7 py-20 flex flex-col items-center text-center">
          <h1 className="text-[17px] font-semibold text-[#16181d]">Seu acesso ainda está sendo configurado</h1>
          <p className="text-[13.5px] text-[#767c88] mt-2 max-w-[420px]">
            Sua conta ainda não foi vinculada a uma empresa. Fale com seu consultor na Ninho Consultoria
            para liberar o acesso ao Portal.
          </p>
        </div>
      ) : (
        <PortalProvider
          valor={{
            userId: profile.id,
            userNome: profile.nome,
            clienteId: profile.cliente_id,
            clienteNome,
            tenantId: profile.tenant_id,
            logoUrl,
          }}
        >
          {children}
        </PortalProvider>
      )}
    </div>
  );
}
