import Image from "next/image";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Força renderização dinâmica: sem isso, o Next.js prerenderiza essa tela
// uma única vez no build e a logo ficaria "congelada" — não atualizaria se
// o escritório trocasse a logo depois do deploy.
export const dynamic = "force-dynamic";

// Server Component: busca a logo do tenant direto com a service role key.
// Não usamos o cliente autenticado aqui porque quem está em /login, por
// definição, ainda não tem sessão — e a tabela configuracoes_empresa é
// protegida por RLS (só time interno logado consegue ler).
async function buscarLogo() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!tenant) return null;

    const { data: configuracoes } = await supabase
      .from("configuracoes_empresa")
      .select("logo_url")
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    return configuracoes?.logo_url ?? null;
  } catch {
    return null;
  }
}

export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = await buscarLogo();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-11 w-auto max-w-[220px] object-contain" />
        ) : (
          <Image src="/logo.png" alt="Ninho Consultoria" width={150} height={60} className="h-11 w-auto" priority />
        )}
      </div>
      <div className="w-full max-w-[400px]">{children}</div>
      <p className="mt-8 text-[12.5px] text-[#9aa0ac]">
        © {new Date().getFullYear()} Ninho Consultoria — plataforma de gestão para consultorias
      </p>
    </div>
  );
}
