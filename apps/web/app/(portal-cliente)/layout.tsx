import { redirect } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sair } from "@/lib/auth/actions";

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
    .select("id, nome, role")
    .eq("id", user.id)
    .maybeSingle();

  // Só o perfil "cliente" usa o Portal. Equipe interna que cair aqui por
  // engano volta para a área de trabalho normal.
  if (!profile || profile.role !== "cliente") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-[#eef0f2] bg-white sticky top-0 z-20">
        <div className="max-w-[1100px] mx-auto px-7 h-[60px] flex items-center justify-between">
          <Image src="/logo.png" alt="Ninho Consultoria" width={110} height={45} className="h-8 w-auto" priority />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#5b6270]">Olá, {profile.nome.split(" ")[0]}</span>
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
      {children}
    </div>
  );
}
