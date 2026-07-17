"use client";

import { useState } from "react";
import { Search, ChevronDown, X, List, Calendar as CalendarIcon } from "lucide-react";
import AgendaList from "./AgendaList";
import AgendaCalendar from "./AgendaCalendar";

export default function AgendaView() {
  const [modo, setModo] = useState<"lista" | "calendario">("calendario");

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[260px]">
          <Search size={14} color="#9aa0ac" />
          <span className="text-[12.5px] text-[#9aa0ac]">Buscar evento, cliente...</span>
        </div>
        {["Todos os tipos", "Todos os consultores", "Todas as prioridades"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]"
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]">
          <X size={13} />
          Limpar
        </button>

        <div className="ml-auto flex items-center bg-[#f5f6f8] rounded-lg p-1 gap-1">
          <button
            onClick={() => setModo("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "lista" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <List size={13} />
            Lista
          </button>
          <button
            onClick={() => setModo("calendario")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "calendario" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <CalendarIcon size={13} />
            Calendário
          </button>
        </div>
      </div>

      {modo === "lista" ? <AgendaList /> : <AgendaCalendar />}
    </div>
  );
}
