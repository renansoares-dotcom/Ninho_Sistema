"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Building2,
  KanbanSquare,
  Stethoscope,
  ChevronDown,
  Search,
  Bell,
} from "lucide-react";
import { Avatar } from "./Avatar";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users2 },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/diagnostico", label: "Diagnóstico", icon: Stethoscope },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#eef0f2] bg-white sticky top-0 z-20">
      <div className="max-w-[1360px] mx-auto px-7 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Ninho Consultoria" width={110} height={45} className="h-8 w-auto" priority />
          </div>

          <nav className="flex items-center gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              const isActive = pathname?.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#f0fbf6] text-primary"
                      : "text-[#5b6270] hover:bg-[#f5f6f8]"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} />
                  {it.label}
                </Link>
              );
            })}
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13.5px] font-medium text-[#5b6270]">
              Mais <ChevronDown size={14} />
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-2.5 py-1.5 w-[200px]">
            <Search size={14} color="#9aa0ac" />
            <span className="text-[12.5px] text-[#9aa0ac]">Pesquisar...</span>
          </div>
          <div className="relative">
            <Bell size={17} color="#5b6270" strokeWidth={1.8} />
            <div className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-[#f04438] border-[1.5px] border-white" />
          </div>
          <Avatar initials="VC" size={30} />
        </div>
      </div>
    </div>
  );
}
