"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export default function ContratoFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [valorTotal, setValorTotal] = useState("");
  const [numParcelas, setNumParcelas] = useState("1");
  const [dataInicio, setDataInicio] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setClienteId("");
    setValorTotal("");
    setNumParcelas("1");
    setDataInicio("");
    setErro(null);
    supabase
      .from("clientes")
      .select("id, nome_fantasia, razao_social")
      .order("nome_fantasia")
      .then(({ data }) => {
        setClientes((data ?? []).map((c) => ({ id: c.id, nome: c.nome_fantasia ?? c.razao_social })));
      });
  }, [open]);

  if (!open) return null;

  async function salvar() {
    if (!clienteId || !valorTotal || !dataInicio) {
      setErro("Cliente, valor total e data de início são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const total = Number(valorTotal);
    const parcelas = Math.max(1, Number(numParcelas));
    const valorParcela = Math.round((total / parcelas) * 100) / 100;

    const { data: contrato, error: erroContrato } = await supabase
      .from("contratos")
      .insert({
        tenant_id: TENANT_ID,
        cliente_id: clienteId,
        valor_total: total,
        num_parcelas: parcelas,
        data_inicio: dataInicio,
        status: "Ativo",
      })
      .select("id")
      .single();

    if (erroContrato || !contrato) {
      setErro(erroContrato?.message ?? "Erro ao criar contrato.");
      setSalvando(false);
      return;
    }

    const parcelasRows = Array.from({ length: parcelas }, (_, i) => {
      const venc = new Date(dataInicio + "T12:00:00");
      venc.setMonth(venc.getMonth() + i + 1);
      return {
        contrato_id: contrato.id,
        numero: i + 1,
        valor: valorParcela,
        vencimento: venc.toISOString().slice(0, 10),
        status: "Pendente",
      };
    });

    const { error: erroParcelas } = await supabase.from("contrato_parcelas").insert(parcelasRows);

    setSalvando(false);

    if (erroParcelas) {
      setErro(erroParcelas.message);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2]">
          <span className="text-[15px] font-semibold text-[#16181d]">Novo contrato</span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Cliente *</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            >
              <option value="">Selecione...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Valor total do contrato (R$) *</label>
            <input
              type="number"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="Ex: 64000"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Nº de parcelas</label>
              <input
                type="number"
                min={1}
                value={numParcelas}
                onChange={(e) => setNumParcelas(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Data de início *</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
          </div>

          <p className="text-[12px] text-[#9aa0ac]">
            As parcelas são geradas automaticamente, com vencimento mensal a partir do mês seguinte ao início.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#eef0f2]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13.5px] font-medium border border-[#e4e6ea] bg-white text-[#3f434d]"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-primary text-white disabled:opacity-60"
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
            Criar contrato
          </button>
        </div>
      </div>
    </div>
  );
}
