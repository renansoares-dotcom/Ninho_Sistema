"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type ClienteFormData = {
  id?: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  segmento: string;
  porte: string;
  num_funcionarios: string;
  faturamento: string;
  status: string;
  logradouro: string;
  cidade: string;
  uf: string;
};

const vazio: ClienteFormData = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  segmento: "",
  porte: "",
  num_funcionarios: "",
  faturamento: "",
  status: "Ativo",
  logradouro: "",
  cidade: "",
  uf: "",
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

export default function ClienteFormModal({
  open,
  onClose,
  onSaved,
  clienteInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  clienteInicial?: ClienteFormData;
}) {
  const [form, setForm] = useState<ClienteFormData>(clienteInicial ?? vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(clienteInicial ?? vazio);
    setErro(null);
  }, [clienteInicial, open]);

  if (!open) return null;

  const set = (campo: keyof ClienteFormData) => (v: string) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    if (!form.razao_social.trim()) {
      setErro("Razão social é obrigatória.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const payload = {
      razao_social: form.razao_social,
      nome_fantasia: form.nome_fantasia || null,
      cnpj: form.cnpj || null,
      segmento: form.segmento || null,
      porte: form.porte || null,
      num_funcionarios: form.num_funcionarios ? Number(form.num_funcionarios) : null,
      faturamento: form.faturamento ? Number(form.faturamento) : null,
      status: form.status,
      endereco: { logradouro: form.logradouro, cidade: form.cidade, uf: form.uf },
    };

    const resultado = form.id
      ? await supabase.from("clientes").update(payload).eq("id", form.id)
      : await supabase.from("clientes").insert({ ...payload, tenant_id: TENANT_ID });

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
            {form.id ? "Editar cliente" : "Novo cliente"}
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
              <Campo label="Razão social *" value={form.razao_social} onChange={set("razao_social")} placeholder="Ex: Ferro Sul Metalúrgica Ltda." />
            </div>
            <Campo label="Nome fantasia" value={form.nome_fantasia} onChange={set("nome_fantasia")} placeholder="Ex: Metalúrgica Ferro Sul" />
            <Campo label="CNPJ" value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
            <Campo label="Segmento" value={form.segmento} onChange={set("segmento")} placeholder="Ex: Indústria" />
            <Campo label="Porte" value={form.porte} onChange={set("porte")} placeholder="Ex: Médio porte" />
            <Campo label="Nº de funcionários" value={form.num_funcionarios} onChange={set("num_funcionarios")} type="number" />
            <Campo label="Faturamento anual (R$)" value={form.faturamento} onChange={set("faturamento")} type="number" />
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status")(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option>Ativo</option>
                <option>Prospect</option>
                <option>Inativo</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f2f3f5]">
            <div className="text-[12.5px] font-semibold text-[#3f434d] mb-3 mt-3">Endereço</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Campo label="Logradouro" value={form.logradouro} onChange={set("logradouro")} />
              </div>
              <Campo label="UF" value={form.uf} onChange={set("uf")} placeholder="PE" />
              <div className="col-span-2">
                <Campo label="Cidade" value={form.cidade} onChange={set("cidade")} />
              </div>
            </div>
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
            {form.id ? "Salvar alterações" : "Criar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
