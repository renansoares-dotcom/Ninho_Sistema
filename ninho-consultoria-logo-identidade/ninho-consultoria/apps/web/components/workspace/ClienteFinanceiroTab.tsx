"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContratoDetalheModal, { ContratoDetalhe } from "@/components/shared/ContratoDetalheModal";
import ContratoFormModal from "@/components/shared/ContratoFormModal";

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
  contrato_parcelas: { id: string; numero: number; valor: number; vencimento: string; status: string; data_pagamento: string | null }[];
};

export default function ClienteFinanceiroTab({ clienteId, clienteNome }: { clienteId: string; clienteNome: string }) {
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoDetalhe | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("contratos")
        .select("id, valor_total, num_parcelas, contrato_parcelas(id, numero, valor, vencimento, status, data_pagamento)")
        .eq("cliente_id", clienteId);
      setContratos((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, [clienteId, internalRefresh]);

  function abrirDetalhe(c: ContratoRow) {
    setContratoSelecionado({
      id: c.id,
      clienteNome,
      valor_total: c.valor_total,
      num_parcelas: c.num_parcelas,
      parcelas: c.contrato_parcelas,
    });
    setModalDetalheAberto(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando financeiro...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setModalNovoAberto(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Novo contrato
        </button>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Valor</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Parcelas</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => {
              const temAtraso = c.contrato_parcelas.some((p) => p.status === "Atrasado");
              return (
                <tr
                  key={c.id}
                  onClick={() => abrirDetalhe(c)}
                  className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-[13px] font-semibold text-primary">{formatarMoeda(c.valor_total)}</td>
                  <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.num_parcelas}x</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[temAtraso ? "Inadimplente" : "Em dia"]}`}>
                      {temAtraso ? "Inadimplente" : "Em dia"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {contratos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-[13px] text-[#9aa0ac]">
                  Nenhum contrato cadastrado ainda para este cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContratoDetalheModal
        open={modalDetalheAberto}
        onClose={() => setModalDetalheAberto(false)}
        onChanged={() => setInternalRefresh((k) => k + 1)}
        contrato={contratoSelecionado}
      />

      <ContratoFormModal
        open={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        clienteIdFixo={clienteId}
      />
    </div>
  );
}
