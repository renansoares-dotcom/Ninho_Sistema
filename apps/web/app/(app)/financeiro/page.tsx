"use client";

import { useState } from "react";
import { Wallet, LineChart, FileBarChart } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import FinanceiroPanel from "@/components/shared/FinanceiroPanel";
import FluxoCaixaPanel from "@/components/shared/FluxoCaixaPanel";
import DrePanel from "@/components/shared/DrePanel";
import ContratoFormModal from "@/components/shared/ContratoFormModal";

type Aba = "contratos" | "fluxo" | "dre";

const abas: { id: Aba; label: string; icon: any }[] = [
  { id: "contratos", label: "Contratos", icon: Wallet },
  { id: "fluxo", label: "Fluxo de Caixa", icon: LineChart },
  { id: "dre", label: "DRE", icon: FileBarChart },
];

export default function FinanceiroPage() {
  const [aba, setAba] = useState<Aba>("contratos");
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        crumb="Início"
        title="Financeiro"
        actionLabel={aba === "contratos" ? "Novo contrato" : undefined}
        onActionClick={() => setModalAberto(true)}
      />

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
        {aba === "contratos" && <FinanceiroPanel refreshKey={refreshKey} />}
        {aba === "fluxo" && <FluxoCaixaPanel />}
        {aba === "dre" && <DrePanel />}
      </div>

      <ContratoFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
