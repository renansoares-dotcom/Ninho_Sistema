"use client";

import { ChevronDown, Search } from "lucide-react";
import OportunidadeCard from "./OportunidadeCard";
import { colunasCRM, oportunidades } from "@/lib/mock-data";

export default function CrmBoard() {
  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[260px]">
          <Search size={14} color="#9aa0ac" />
          <span className="text-[12.5px] text-[#9aa0ac]">Buscar oportunidade ou empresa...</span>
        </div>
        {["Todos os responsáveis", "Origem", "Valor"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]"
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-3">
        {colunasCRM.map((col) => {
          const items = oportunidades.filter((o) => o.etapa === col.id);
          const total = items.reduce(
            (acc, o) => acc + Number(o.valor.replace(/[^\d]/g, "")),
            0
          );
          return (
            <div key={col.id} className="min-w-[232px] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 px-0.5">
                <div className="w-[7px] h-[7px] rounded-full" style={{ background: col.cor }} />
                <span className="text-[12.5px] font-semibold text-[#3f434d]">{col.nome}</span>
                <span className="text-[11.5px] text-[#b0b4bb]">{items.length}</span>
                <span className="text-[11px] text-[#b0b4bb] ml-auto">
                  R$ {(total / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((op) => (
                  <OportunidadeCard key={op.id} op={op} />
                ))}
                {items.length === 0 && (
                  <div className="border-[1.5px] border-dashed border-[#e4e6ea] rounded-xl py-4.5 px-2.5 text-center text-xs text-[#c2c6cd]">
                    Sem oportunidades
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
