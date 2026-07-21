"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, LineChart, Folder, MessageCircle } from "lucide-react";

const items = [
  { href: "/portal", label: "Meu Painel", icon: LayoutDashboard },
  { href: "/portal/plano-trabalho", label: "Plano de Trabalho", icon: ClipboardList },
  { href: "/portal/indicadores", label: "Indicadores", icon: LineChart },
  { href: "/portal/arquivos", label: "Arquivos", icon: Folder },
  { href: "/portal/mensagens", label: "Mensagens", icon: MessageCircle },
];

export default function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = it.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors ${
              isActive ? "bg-[#eaf1fb] text-primary" : "text-[#5b6270] hover:bg-[#f5f6f8]"
            }`}
          >
            <Icon size={15} strokeWidth={2} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
