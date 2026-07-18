"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { colunasKanban } from "@/lib/mock-data";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type TarefaFormData = {
  id?: string;
  titulo: string;
  cliente_id: string;
  coluna: string;
  prioridade: string;
  data_conclusao: string;
  responsavel_nome: string;
};

const vazio: TarefaFormData = {
  titulo: "",
  cliente_id: "",
  coluna: "afazer",
  prioridade: "Média",
  data_conclusao: "",
  responsavel_nome: "",
};

export default function TarefaFormModal({
  open,
  onClose,
  onSaved,
  onDeleted,
  tarefaInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  tarefaInicial?: TarefaFormData;
}) {
  const [form, setForm] = useState<TarefaFormData>(tarefaInicial ?? vazio);
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(tarefaInicial ?? vazio);
    setErro(null);
  }, [tarefaInicial, open]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("clientes")
      .select("id, nome_fantasia, razao_social")
      .order("nome_fantasia")
      .then(({ data }) => {
        setClientes((data ?? []).map((c) => ({ id: c.id, nome: c.nome_fantasia ?? c.razao_social })));
      });
  }, [open]);

  if (!open) return null;

  const set = (campo: keyof TarefaFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.titulo.trim()) {
      setErro("Título é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const payload = {
      titulo: form.titulo,
      cliente_id: form.cliente_id || null,
      coluna: form.coluna,
      prioridade: form.prioridade,
      data_conclusao: form.data_conclusao || null,
      responsavel_nome: form.responsavel_nome || null,
    };

    const resultado = form.id
      ? await supabase.from("tarefas").update(payload).eq("id", form.id)
      : await supabase.from("tarefas").insert({ ...payload, tenant_id: TENANT_ID });

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
    if (!confirm(`Tem certeza que deseja excluir a tarefa "${form.titulo}"?`)) return;
    setExcluindo(true);
    const { error } = await supabase.from("tarefas").delete().eq("id", form.id);
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
      <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white">
          <span className="text-[15px] font-semibold text-[#16181d]">
            {form.id ? "Editar tarefa" : "Nova tarefa"}
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
              placeholder="Ex: Levantar dados financeiros"
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Cliente</label>
            <select
              value={form.cliente_id}
              onChange={(e) => set("cliente_id")(e.target.value)}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            >
              <option value="">Nenhum</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Coluna</label>
              <select
                value={form.coluna}
                onChange={(e) => set("coluna")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                {colunasKanban.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
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
                value={form.data_conclusao}
                onChange={(e) => set("data_conclusao")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Responsável (iniciais)</label>
              <input
                value={form.responsavel_nome}
                onChange={(e) => set("responsavel_nome")(e.target.value)}
                placeholder="Ex: MC"
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
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
              {form.id ? "Salvar alterações" : "Criar tarefa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
