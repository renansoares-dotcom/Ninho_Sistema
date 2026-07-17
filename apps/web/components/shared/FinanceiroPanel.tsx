"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, AlertCircle, Receipt, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  "Em dia": "bg-[#eafaf1] text-[#0e9f6e]",
  "Inadimplente": "bg-[#fdecea] text-[#f04438]",
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

type ContratoRow = {
  id: string;
  valor_total: number;
  num_parcelas: number;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
  contrato_parcelas: { valor: number; vencimento: string; status: string; data_pagamento: string | null }[];
};

export default function FinanceiroPanel() {
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("contratos")
        .select("id, valor_total, num_parcelas, clientes(nome_fantasia, razao_social), contrato_parcelas(valor, vencimento, status, data_pagamento)");

      if (error) setErro(error.message);
      setContratos((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  const todasParcelas = contratos.flatMap((c) => c.contrato_parcelas);
  const recebido = todasParcelas.filter((p) => p.status === "Pago").reduce((acc, p) => acc + p.valor, 0);
  const aReceber = todasParcelas.filter((p) => p.status === "Pendente").reduce((acc, p) => acc + p.valor, 0);
  const inadimplencia = todasParcelas.filter((p) => p.status === "Atrasado").reduce((acc, p) => acc + p.valor, 0);
  const ticketMedio = contratos.length > 0 ? contratos.reduce((acc, c) => acc + c.valor_total, 0) / contratos.length : 0;

  const financeiroKpis = [
    { label: "Recebido (parcelas pagas)", value: formatarMoeda(recebido), icon: Wallet },
    { label: "A receber", value: formatarMoeda(aReceber), icon: TrendingUp },
    { label: "Inadimplência", value: formatarMoeda(inadimplencia), icon: AlertCircle },
    { label: "Ticket médio", value: formatarMoeda(ticketMedio), icon: Receipt },
  ];

  if (carregando) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex items-center justify-center gap-2 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando dados financeiros...
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
      {erro && (
        <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">
          Não foi possível carregar o financeiro: {erro}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3.5">
        {financeiroKpis.map((k) => {
          const Icon = k.icon;
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
            {contratos.map((c) => {
              const temAtraso = c.contrato_parcelas.some((p) => p.status === "Atrasado");
              const pendentes = c.contrato_parcelas
                .filter((p) => p.status === "Pendente" || p.status === "Atrasado")
                .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
              const proximoVenc = pendentes[0]?.vencimento;
              return (
                <tr key={c.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors">
                  <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">
                    {c.clientes?.nome_fantasia ?? c.clientes?.razao_social ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-[13px] font-semibold text-primary">{formatarMoeda(c.valor_total)}</td>
                  <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.num_parcelas}x</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[temAtraso ? "Inadimplente" : "Em dia"]}`}>
                      {temAtraso ? "Inadimplente" : "Em dia"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[12.5px] text-[#9aa0ac]">
                    {proximoVenc ? new Date(proximoVenc + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
            {contratos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-[#9aa0ac]">
                  Nenhum contrato cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
