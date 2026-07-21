"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type PlanoAcaoFormData = {
  id?: string;
  titulo: string;
  responsavel_nome: string;
  prioridade: string;
  prazo: string;
  status: string;
  observacoes: string;
};

const vazio: PlanoAcaoFormData = {
  titulo: "",
  responsavel_nome: "",
  prioridade: "Média",
  prazo: "",
  status: "Pendente",
  observacoes: "",
};

export default function PlanoAcaoFormModal({
  open,
  onClose,
  onSaved,
  onDeleted,
  planoId,
  acaoInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  planoId: string;
  acaoInicial?: PlanoAcaoFormData;
}) {
  const [form, setForm] = useState<PlanoAcaoFormData>(acaoInicial ?? vazio);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(acaoInicial ?? vazio);
    setErro(null);
  }, [acaoInicial, open]);

  if (!open) return null;

  const set = (campo: keyof PlanoAcaoFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.titulo.trim()) {
      setErro("Título é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const payload = {
      titulo: form.titulo,
      responsavel_nome: form.responsavel_nome || null,
      prioridade: form.prioridade,
      prazo: form.prazo || null,
      status: form.status,
      observacoes: form.observacoes || null,
    };

    const resultado = form.id
      ? await supabase.from("plano_acoes").update(payload).eq("id", form.id)
      : await supabase.from("plano_acoes").insert({ ...payload, plano_id: planoId });

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
    if (!confirm(`Excluir a ação "${form.titulo}"?`)) return;
    setExcluindo(true);
    const { error } = await supabase.from("plano_acoes").delete().eq("id", form.id);
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
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2]">
          <span className="text-[15px] font-semibold text-[#16181d]">
            {form.id ? "Editar ação" : "Nova ação"}
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
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => set("titulo")(e.target.value)}
              placeholder="Ex: Estruturar fluxo de caixa semanal"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Responsável (iniciais)</label>
              <input
                value={form.responsavel_nome}
                onChange={(e) => set("responsavel_nome")(e.target.value)}
                placeholder="Ex: MC"
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Prioridade</label>
              <select
                value={form.prioridade}
                onChange={(e) => set("prioridade")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Prazo</label>
              <input
                type="date"
                value={form.prazo}
                onChange={(e) => set("prazo")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option>Pendente</option>
                <option>Em andamento</option>
                <option>Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => set("observacoes")(e.target.value)}
              rows={3}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
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
              {form.id ? "Salvar alterações" : "Criar ação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
