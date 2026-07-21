"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KpiFormModal({
  open,
  onClose,
  onSaved,
  clienteId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  clienteId: string;
}) {
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [valorBaseline, setValorBaseline] = useState("");
  const [dataBaseline, setDataBaseline] = useState(() => new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!open) return null;

  async function salvar() {
    if (!nome.trim() || !valorBaseline) {
      setErro("Nome do KPI e valor inicial são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const { data: kpi, error } = await supabase
      .from("kpi_definicoes")
      .insert({ cliente_id: clienteId, nome, unidade: unidade || null })
      .select("id")
      .single();

    if (error || !kpi) {
      setErro(error?.message ?? "Erro ao criar KPI.");
      setSalvando(false);
      return;
    }

    const { error: erroValor } = await supabase.from("kpi_valores").insert({
      kpi_id: kpi.id,
      data_referencia: dataBaseline,
      valor: Number(valorBaseline),
      tipo: "baseline",
    });

    setSalvando(false);

    if (erroValor) {
      setErro(erroValor.message);
      return;
    }

    setNome("");
    setUnidade("");
    setValorBaseline("");
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2]">
          <span className="text-[15px] font-semibold text-[#16181d]">Novo indicador (KPI)</span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Nome do indicador *</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Faturamento mensal, Ticket médio, Margem líquida"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Unidade</label>
            <input
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex: R$, %, dias, unidades"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Valor inicial (baseline) *</label>
              <input
                type="number"
                value={valorBaseline}
                onChange={(e) => setValorBaseline(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Data de referência</label>
              <input
                type="date"
                value={dataBaseline}
                onChange={(e) => setDataBaseline(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
          </div>

          <p className="text-[11.5px] text-[#9aa0ac]">
            Esse valor inicial fica registrado como referência (baseline). Depois é só ir adicionando novas leituras pra ver a evolução.
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
            Criar KPI
          </button>
        </div>
      </div>
    </div>
  );
}
