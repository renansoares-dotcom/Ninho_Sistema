"use client";

import { LayoutGrid, Clock, KanbanSquare, CalendarDays, Stethoscope, Wallet, Folder, MapPin, ClipboardList, LineChart, MessageCircle } from "lucide-react";

export type AbaWorkspace = "visao-geral" | "timeline" | "kanban" | "agenda" | "diagnostico" | "financeiro" | "arquivos" | "visitas" | "plano-trabalho" | "kpis" | "mensagens";

const abas: { id: AbaWorkspace; label: string; icon: any }[] = [
  { id: "visao-geral", label: "Visão Geral", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "diagnostico", label: "Diagnóstico", icon: Stethoscope },
  { id: "plano-trabalho", label: "Plano de Trabalho", icon: ClipboardList },
  { id: "kpis", label: "KPIs", icon: LineChart },
  { id: "kanban", label: "Kanban", icon: KanbanSquare },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "visitas", label: "Visitas", icon: MapPin },
  { id: "financeiro", label: "Financeiro", icon: Wallet },
  { id: "arquivos", label: "Arquivos", icon: Folder },
  { id: "mensagens", label: "Mensagens", icon: MessageCircle },
];

export default function WorkspaceTabs({
  ativa,
  onChange,
}: {
  ativa: AbaWorkspace;
  onChange: (aba: AbaWorkspace) => void;
}) {
  return (
    <div className="max-w-[1360px] mx-auto px-7 border-b border-[#eef0f2] mt-3">
      <div className="flex items-center gap-1 overflow-x-auto">
        {abas.map((aba) => {
          const Icon = aba.icon;
          const isAtiva = ativa === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => onChange(aba.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isAtiva
                  ? "border-primary text-primary"
                  : "border-transparent text-[#767c88] hover:text-[#3f434d]"
              }`}
            >
              <Icon size={14} />
              {aba.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
