"use client";

import { useState } from "react";
import { FileText, Settings2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import FaturamentoConfigPanel from "@/components/shared/FaturamentoConfigPanel";
import NotasFiscaisList from "@/components/shared/NotasFiscaisList";

type Aba = "notas" | "configuracao";

const abas: { id: Aba; label: string; icon: any }[] = [
  { id: "notas", label: "Notas Fiscais", icon: FileText },
  { id: "configuracao", label: "Configuração", icon: Settings2 },
];

export default function FaturamentoPage() {
  const [aba, setAba] = useState<Aba>("notas");

  return (
    <>
      <PageHeader crumb="Início" title="Faturamento" />

      <div className="max-w-[1360px] mx-auto px-7 border-b border-[#eef0f2] mt-3">
        <div className="flex items-center gap-1">
          {abas.map((a) => {
            const Icon = a.icon;
            const isAtiva = aba === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                  isAtiva ? "border-primary text-primary" : "border-transparent text-[#767c88] hover:text-[#3f434d]"
                }`}
              >
                <Icon size={14} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-5">
        {aba === "notas" && <NotasFiscaisList />}
        {aba === "configuracao" && <FaturamentoConfigPanel />}
      </div>
    </>
  );
}
