"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { automacoesRegras } from "@/lib/mock-data";

export default function AutomacoesList() {
  const [regras, setRegras] = useState(automacoesRegras);

  function toggle(id: number) {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)));
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex flex-col gap-2.5">
        {regras.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
              <Zap size={18} color="#004AAD" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-[#16181d]">{r.nome}</div>
              <div className="text-[12px] text-[#9aa0ac] mt-0.5">Gatilho: {r.gatilho}</div>
            </div>
            <button
              onClick={() => toggle(r.id)}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                r.ativa ? "bg-primary" : "bg-[#e4e6ea]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  r.ativa ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
