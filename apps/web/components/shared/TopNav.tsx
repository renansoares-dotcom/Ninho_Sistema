"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users2,
  Building2,
  KanbanSquare,
  Stethoscope,
  ChevronDown,
  Search,
  Bell,
  CalendarDays,
  Wallet,
  FileText,
  Zap,
  Settings,
  Folder,
  Receipt,
} from "lucide-react";
import { Avatar } from "./Avatar";
import GlobalSearch from "./GlobalSearch";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users2 },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/diagnostico", label: "Diagnóstico", icon: Stethoscope },
];

const maisItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/arquivos", label: "Arquivos", icon: Folder },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/faturamento", label: "Faturamento", icon: Receipt },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/automacoes", label: "Automações", icon: Zap },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function TopNav() {
  const pathname = usePathname();
  const [maisOpen, setMaisOpen] = useState(false);
  const maisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (maisRef.current && !maisRef.current.contains(e.target as Node)) {
        setMaisOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const maisAtivo = maisItems.some((it) => pathname?.startsWith(it.href));

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
                      ? "bg-[#eaf1fb] text-primary"
                      : "text-[#5b6270] hover:bg-[#f5f6f8]"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} />
                  {it.label}
                </Link>
              );
            })}
            <div className="relative" ref={maisRef}>
              <button
                onClick={() => setMaisOpen((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13.5px] font-medium ${
                  maisAtivo ? "bg-[#eaf1fb] text-primary" : "text-[#5b6270] hover:bg-[#f5f6f8]"
                }`}
              >
                Mais
                <ChevronDown size={14} className={maisOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {maisOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-[#eef0f2] rounded-xl shadow-lg py-1.5 min-w-[190px] z-30">
                  {maisItems.map((it) => {
                    const Icon = it.icon;
                    const isActive = pathname?.startsWith(it.href);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setMaisOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium ${
                          isActive ? "text-primary bg-[#eaf1fb]" : "text-[#3f434d] hover:bg-[#f5f6f8]"
                        }`}
                      >
                        <Icon size={15} strokeWidth={2} />
                        {it.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3.5">
          <GlobalSearch />
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
