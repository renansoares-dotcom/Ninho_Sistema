"use client";

import { useState } from "react";
import { X, Loader2, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Parcela = {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: string;
  data_pagamento: string | null;
};

export type ContratoDetalhe = {
  id: string;
  clienteNome: string;
  valor_total: number;
  num_parcelas: number;
  parcelas: Parcela[];
};

const statusStyles: Record<string, string> = {
  Pago: "bg-[#eafaf1] text-[#0e9f6e]",
  Pendente: "bg-[#f5f6f8] text-[#767c88]",
  Atrasado: "bg-[#fdecea] text-[#f04438]",
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

export default function ContratoDetalheModal({
  open,
  onClose,
  onChanged,
  contrato,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  contrato?: ContratoDetalhe;
}) {
  const [processando, setProcessando] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!open || !contrato) return null;

  async function marcarComoPago(parcelaId: string) {
    setProcessando(parcelaId);
    setErro(null);
    const { error } = await supabase
      .from("contrato_parcelas")
      .update({ status: "Pago", data_pagamento: new Date().toISOString().slice(0, 10) })
      .eq("id", parcelaId);
    setProcessando(null);
    if (error) {
      setErro(error.message);
      return;
    }
    onChanged();
  }

  async function excluirContrato() {
    if (!contrato) return;
    if (!confirm(`Tem certeza que deseja excluir este contrato e todas as suas parcelas?`)) return;
    setExcluindo(true);
    const { error } = await supabase.from("contratos").delete().eq("id", contrato.id);
    setExcluindo(false);
    if (error) {
      setErro(error.message);
      return;
    }
    onChanged();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[540px] max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white">
          <div>
            <span className="text-[15px] font-semibold text-[#16181d]">{contrato.clienteNome}</span>
            <div className="text-[12.5px] text-[#9aa0ac]">
              {formatarMoeda(contrato.valor_total)} em {contrato.num_parcelas}x
            </div>
          </div>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-2.5">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          {contrato.parcelas
            .sort((a, b) => a.numero - b.numero)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border border-[#eef0f2] rounded-xl px-4 py-3"
              >
                <div>
                  <div className="text-[13.5px] font-medium text-[#16181d]">Parcela {p.numero}</div>
                  <div className="text-[12px] text-[#9aa0ac]">
                    {formatarMoeda(p.valor)} · vence em {new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyles[p.status] ?? statusStyles.Pendente}`}>
                    {p.status}
                  </span>
                  {p.status !== "Pago" && (
                    <button
                      onClick={() => marcarComoPago(p.id)}
                      disabled={processando === p.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold bg-[#eafaf1] text-[#0e9f6e] hover:bg-[#d8f3e4] disabled:opacity-60"
                    >
                      {processando === p.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Marcar pago
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#eef0f2] sticky bottom-0 bg-white">
          <button
            onClick={excluirContrato}
            disabled={excluindo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium border border-[#f5c2bd] text-[#f04438] hover:bg-[#fdecea] disabled:opacity-60"
          >
            {excluindo ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Excluir contrato
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13.5px] font-medium border border-[#e4e6ea] bg-white text-[#3f434d]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
