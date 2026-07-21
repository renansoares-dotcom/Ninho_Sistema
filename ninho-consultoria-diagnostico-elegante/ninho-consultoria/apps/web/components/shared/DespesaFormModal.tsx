"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type DespesaFormData = {
  id?: string;
  descricao: string;
  categoria: string;
  valor: string;
  data: string;
  tipo: string;
};

const vazio: DespesaFormData = {
  descricao: "",
  categoria: "Estrutura",
  valor: "",
  data: "",
  tipo: "Pontual",
};

const categorias = ["Estrutura", "Pessoal", "Tecnologia", "Administrativo", "Marketing", "Operacional"];

export default function DespesaFormModal({
  open,
  onClose,
  onSaved,
  onDeleted,
  despesaInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  despesaInicial?: DespesaFormData;
}) {
  const [form, setForm] = useState<DespesaFormData>(despesaInicial ?? vazio);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(despesaInicial ?? vazio);
    setErro(null);
  }, [despesaInicial, open]);

  if (!open) return null;

  const set = (campo: keyof DespesaFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.descricao.trim() || !form.valor || !form.data) {
      setErro("Descrição, valor e data são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const payload = {
      descricao: form.descricao,
      categoria: form.categoria,
      valor: Number(form.valor),
      data: form.data,
      tipo: form.tipo,
    };

    const resultado = form.id
      ? await supabase.from("despesas").update(payload).eq("id", form.id)
      : await supabase.from("despesas").insert({ ...payload, tenant_id: TENANT_ID });

    setSalvando(false);

    if (resultado.error) {
      setErro(resultado.error.message);
      return;
    }

    onSaved();
    onClose();
  }

  async function excluir() {
    if (!form.id) return;
    if (!confirm(`Excluir a despesa "${form.descricao}"?`)) return;
    setExcluindo(true);
    const { error } = await supabase.from("despesas").delete().eq("id", form.id);
    setExcluindo(false);
    if (error) {
      setErro(error.message);
      return;
    }
    onDeleted?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2]">
          <span className="text-[15px] font-semibold text-[#16181d]">
            {form.id ? "Editar despesa" : "Nova despesa"}
          </span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Descrição *</label>
            <input
              value={form.descricao}
              onChange={(e) => set("descricao")(e.target.value)}
              placeholder="Ex: Aluguel do escritório"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => set("categoria")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => set("tipo")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option>Pontual</option>
                <option>Recorrente</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Valor (R$) *</label>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => set("valor")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Data *</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => set("data")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[#eef0f2]">
          {form.id ? (
            <button
              onClick={excluir}
              disabled={excluindo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium border border-[#f5c2bd] text-[#f04438] hover:bg-[#fdecea] disabled:opacity-60"
            >
              {excluindo ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Excluir
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
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
              {form.id ? "Salvar alterações" : "Criar despesa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
