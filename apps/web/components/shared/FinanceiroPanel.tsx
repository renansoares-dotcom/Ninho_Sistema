import { Wallet, TrendingUp, AlertCircle, Receipt } from "lucide-react";
import { financeiroKpis, contratos } from "@/lib/mock-data";

const icones = [Wallet, TrendingUp, AlertCircle, Receipt];

const statusStyles: Record<string, string> = {
  "Em dia": "bg-[#eafaf1] text-[#0e9f6e]",
  "Inadimplente": "bg-[#fdecea] text-[#f04438]",
};

export default function FinanceiroPanel() {
  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3.5">
        {financeiroKpis.map((k, i) => {
          const Icon = icones[i];
          return (
            <div
              key={k.label}
              className="bg-white border border-[#eef0f2] rounded-2xl p-[18px_20px] flex flex-col gap-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-[#767c88] font-medium">{k.label}</span>
                <div className="w-[30px] h-[30px] rounded-lg bg-[#f5f6f8] flex items-center justify-center">
                  <Icon size={15} color="#5b6270" strokeWidth={1.8} />
                </div>
              </div>
              <span className="text-2xl font-bold text-[#16181d] tracking-tight">{k.value}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Cliente</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Valor do contrato</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Parcelas</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Próximo vencimento</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors">
                <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">{c.cliente}</td>
                <td className="px-5 py-4 text-[13px] font-semibold text-primary">{c.valor}</td>
                <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.parcelas}</td>
                <td className="px-5 py-4">
                  <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[12.5px] text-[#9aa0ac]">{c.proximoVenc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
