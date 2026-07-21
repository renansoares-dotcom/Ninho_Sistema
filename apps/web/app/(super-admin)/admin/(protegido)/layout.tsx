import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Building2, Wallet, Users2, LayoutGrid } from "lucide-react";
import { exigirSuperAdmin } from "@/lib/auth/super-admin";
import { sair } from "@/lib/auth/actions";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await exigirSuperAdmin();
  if (!user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0d0f13]">
      <div className="border-b border-white/10 bg-[#14171d] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-7 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={100} height={40} className="h-7 w-auto brightness-0 invert opacity-90" />
              <span className="text-[11px] font-semibold text-[#4B93E8] uppercase tracking-wide bg-[#4B93E8]/10 px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white">
                <Building2 size={14} /> Escritórios
              </Link>
              <Link href="/admin/financeiro" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white">
                <Wallet size={14} /> Financeiro
              </Link>
              <Link href="/admin/usuarios" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white">
                <Users2 size={14} /> Usuários
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white">
              <LayoutGrid size={14} /> Voltar ao sistema
            </Link>
            <form action={sair}>
              <button type="submit" className="flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-[#f04438]">
                <LogOut size={14} /> Sair
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-7 py-8">{children}</div>
    </div>
  );
}
