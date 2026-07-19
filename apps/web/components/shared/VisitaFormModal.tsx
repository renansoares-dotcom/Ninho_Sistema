"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type VisitaFormData = {
  id?: string;
  cliente_id: string;
  data: string;
  hora: string;
  objetivo: string;
  relato: string;
  decisoes: string;
  pendencias: string;
};

const vazio: VisitaFormData = {
  cliente_id: "",
  data: "",
  hora: "09:00",
  objetivo: "",
  relato: "",
  decisoes: "",
  pendencias: "",
};

export default function VisitaFormModal({
  open,
  onClose,
  onSaved,
  onDeleted,
  visitaInicial,
  clienteIdFixo,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  visitaInicial?: VisitaFormData;
  clienteIdFixo?: string;
}) {
  const [form, setForm] = useState<VisitaFormData>(visitaInicial ?? { ...vazio, cliente_id: clienteIdFixo ?? "" });
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(visitaInicial ?? { ...vazio, cliente_id: clienteIdFixo ?? "" });
    setErro(null);
  }, [visitaInicial, open, clienteIdFixo]);

  useEffect(() => {
    if (!open || clienteIdFixo) return;
    supabase
      .from("clientes")
      .select("id, nome_fantasia, razao_social")
      .order("nome_fantasia")
      .then(({ data }) => {
        setClientes((data ?? []).map((c) => ({ id: c.id, nome: c.nome_fantasia ?? c.razao_social })));
      });
  }, [open, clienteIdFixo]);

  if (!open) return null;

  const set = (campo: keyof VisitaFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.cliente_id || !form.data) {
      setErro("Cliente e data são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const payload = {
      cliente_id: form.cliente_id,
      data: form.data,
      hora: form.hora || null,
      objetivo: form.objetivo || null,
      relato: form.relato || null,
      decisoes: form.decisoes || null,
      pendencias: form.pendencias || null,
    };

    const resultado = form.id
      ? await supabase.from("visitas").update(payload).eq("id", form.id)
      : await supabase.from("visitas").insert({ ...payload, tenant_id: TENANT_ID });

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
    if (!confirm("Tem certeza que deseja excluir este registro de visita?")) return;
    setExcluindo(true);
    const { error } = await supabase.from("visitas").delete().eq("id", form.id);
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
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white">
          <span className="text-[15px] font-semibold text-[#16181d]">
            {form.id ? "Editar registro de visita" : "Nova visita"}
          </span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          {!clienteIdFixo && (
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Cliente *</label>
              <select
                value={form.cliente_id}
                onChange={(e) => set("cliente_id")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Data *</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => set("data")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => set("hora")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Objetivo da visita</label>
            <input
              value={form.objetivo}
              onChange={(e) => set("objetivo")(e.target.value)}
              placeholder="Ex: Acompanhamento do plano de trabalho"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Relato</label>
            <textarea
              value={form.relato}
              onChange={(e) => set("relato")(e.target.value)}
              rows={3}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Decisões tomadas</label>
            <textarea
              value={form.decisoes}
              onChange={(e) => set("decisoes")(e.target.value)}
              rows={2}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Pendências</label>
            <textarea
              value={form.pendencias}
              onChange={(e) => set("pendencias")(e.target.value)}
              rows={2}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[#eef0f2] sticky bottom-0 bg-white">
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
              {form.id ? "Salvar alterações" : "Registrar visita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
