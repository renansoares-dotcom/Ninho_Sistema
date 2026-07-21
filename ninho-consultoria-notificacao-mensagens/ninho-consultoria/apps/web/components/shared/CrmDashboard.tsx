import { TrendingUp, Target, XCircle, Wallet } from "lucide-react";
import type { Oportunidade } from "./OportunidadeCard";

function formatarValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function CrmDashboard({ oportunidades }: { oportunidades: Oportunidade[] }) {
  const abertas = oportunidades.filter((o) => o.etapa !== "ativo" && !o.perdida);
  const pipelineTotal = abertas.reduce((acc, o) => acc + o.valor, 0);
  const ticketMedio = abertas.length > 0 ? pipelineTotal / abertas.length : 0;
  const fechadas = oportunidades.filter((o) => o.etapa === "ativo").length;
  const perdidas = oportunidades.filter((o) => o.perdida).length;
  const totalFinalizadas = fechadas + perdidas;
  const taxaConversao = totalFinalizadas > 0 ? Math.round((fechadas / totalFinalizadas) * 100) : 0;

  const kpis = [
    { label: "Pipeline em aberto", value: formatarValor(pipelineTotal), icon: Wallet },
    { label: "Ticket médio", value: formatarValor(ticketMedio), icon: TrendingUp },
    { label: "Taxa de conversão", value: `${taxaConversao}%`, icon: Target },
    { label: "Oportunidades perdidas", value: String(perdidas), icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-4 gap-3.5 mb-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div
            key={k.label}
            className="bg-white border border-[#eef0f2] rounded-2xl p-[16px_18px] flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#767c88] font-medium">{k.label}</span>
              <div className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center">
                <Icon size={13} color="#5b6270" strokeWidth={1.8} />
              </div>
            </div>
            <span className="text-[20px] font-bold text-[#16181d] tracking-tight">{k.value}</span>
          </div>
        );
      })}
    </div>
  );
}
