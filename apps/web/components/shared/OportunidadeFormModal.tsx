"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { colunasCRM } from "@/lib/mock-data";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type OportunidadeFormData = {
  id?: string;
  empresa_nome: string;
  responsavel_nome: string;
  telefone: string;
  email: string;
  origem: string;
  etapa: string;
  valor_estimado: string;
  probabilidade: string;
  observacoes: string;
};

const vazio: OportunidadeFormData = {
  empresa_nome: "",
  responsavel_nome: "",
  telefone: "",
  email: "",
  origem: "",
  etapa: "lead",
  valor_estimado: "",
  probabilidade: "20",
  observacoes: "",
};

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[12px] text-[#9aa0ac] mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

export default function OportunidadeFormModal({
  open,
  onClose,
  onSaved,
  oportunidadeInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  oportunidadeInicial?: OportunidadeFormData;
}) {
  const [form, setForm] = useState<OportunidadeFormData>(oportunidadeInicial ?? vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(oportunidadeInicial ?? vazio);
    setErro(null);
  }, [oportunidadeInicial, open]);

  if (!open) return null;

  const set = (campo: keyof OportunidadeFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.empresa_nome.trim()) {
      setErro("Nome da empresa é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const etapaDb = form.etapa === "ativo" ? "cliente_ativo" : form.etapa;

    const payload = {
      empresa_nome: form.empresa_nome,
      responsavel_nome: form.responsavel_nome || null,
      telefone: form.telefone || null,
      email: form.email || null,
      origem: form.origem || null,
      etapa: etapaDb,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
      probabilidade: form.probabilidade ? Number(form.probabilidade) : 0,
      observacoes: form.observacoes || null,
    };

    const resultado = form.id
      ? await supabase.from("leads_oportunidades").update(payload).eq("id", form.id)
      : await supabase.from("leads_oportunidades").insert({ ...payload, tenant_id: TENANT_ID });

    setSalvando(false);

    if (resultado.error) {
      setErro(resultado.error.message);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white">
          <span className="text-[15px] font-semibold text-[#16181d]">
            {form.id ? "Editar oportunidade" : "Nova oportunidade"}
          </span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Campo label="Nome da empresa *" value={form.empresa_nome} onChange={set("empresa_nome")} placeholder="Ex: Studio Criativo Nix" />
            </div>
            <Campo label="Responsável (iniciais)" value={form.responsavel_nome} onChange={set("responsavel_nome")} placeholder="Ex: MC" />
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Etapa</label>
              <select
                value={form.etapa}
                onChange={(e) => set("etapa")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                {colunasCRM.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <Campo label="Telefone" value={form.telefone} onChange={set("telefone")} />
            <Campo label="E-mail" value={form.email} onChange={set("email")} type="email" />
            <Campo label="Origem do lead" value={form.origem} onChange={set("origem")} placeholder="Ex: Indicação" />
            <Campo label="Valor estimado (R$)" value={form.valor_estimado} onChange={set("valor_estimado")} type="number" />
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Probabilidade (%)</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.probabilidade}
                onChange={(e) => set("probabilidade")(e.target.value)}
                className="w-full accent-[#004AAD]"
              />
              <span className="text-[12.5px] text-[#5b6270]">{form.probabilidade}%</span>
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => set("observacoes")(e.target.value)}
              rows={3}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#eef0f2] sticky bottom-0 bg-white">
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
            {form.id ? "Salvar alterações" : "Criar oportunidade"}
          </button>
        </div>
      </div>
    </div>
  );
}
