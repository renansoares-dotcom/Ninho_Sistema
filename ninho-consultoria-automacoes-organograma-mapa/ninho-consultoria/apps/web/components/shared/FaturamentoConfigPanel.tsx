"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Info } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

type ConfigFiscal = {
  codigo_servico_padrao: string;
  aliquota_iss: string;
  serie_nfe: string;
  proximo_numero_nfe: string;
  ambiente_nfe: string;
  focus_nfe_token: string;
};

const vazio: ConfigFiscal = {
  codigo_servico_padrao: "",
  aliquota_iss: "",
  serie_nfe: "1",
  proximo_numero_nfe: "1",
  ambiente_nfe: "Homologação",
  focus_nfe_token: "",
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

export default function FaturamentoConfigPanel() {
  const [form, setForm] = useState<ConfigFiscal>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("configuracoes_empresa")
        .select("codigo_servico_padrao, aliquota_iss, serie_nfe, proximo_numero_nfe, ambiente_nfe, focus_nfe_token")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();

      if (data) {
        setForm({
          codigo_servico_padrao: data.codigo_servico_padrao ?? "",
          aliquota_iss: data.aliquota_iss ? String(data.aliquota_iss) : "",
          serie_nfe: data.serie_nfe ?? "1",
          proximo_numero_nfe: data.proximo_numero_nfe ? String(data.proximo_numero_nfe) : "1",
          ambiente_nfe: data.ambiente_nfe ?? "Homologação",
          focus_nfe_token: data.focus_nfe_token ?? "",
        });
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  const set = (campo: keyof ConfigFiscal) => (v: string) => {
    setForm((f) => ({ ...f, [campo]: v }));
    setSalvo(false);
  };

  async function salvar() {
    setSalvando(true);
    setErro(null);

    const payload = {
      tenant_id: TENANT_ID,
      codigo_servico_padrao: form.codigo_servico_padrao || null,
      aliquota_iss: form.aliquota_iss ? Number(form.aliquota_iss) : null,
      serie_nfe: form.serie_nfe || "1",
      proximo_numero_nfe: form.proximo_numero_nfe ? Number(form.proximo_numero_nfe) : 1,
      ambiente_nfe: form.ambiente_nfe,
      focus_nfe_token: form.focus_nfe_token || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("configuracoes_empresa")
      .upsert(payload, { onConflict: "tenant_id" });

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando configuração fiscal...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">{erro}</div>
      )}
      {salvo && (
        <div className="text-[13px] text-[#0e9f6e] bg-[#eafaf1] rounded-lg px-4 py-3">
          Configuração fiscal salva com sucesso.
        </div>
      )}

      <Card title="Emissão de notas fiscais (Focus NFe)">
        <div className="flex items-start gap-2 mb-4 bg-[#eaf1fb] text-primary rounded-lg px-3 py-2.5 text-[12.5px]">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            A integração com o Focus NFe ainda não foi contratada — a emissão de notas nesse módulo é <strong>simulada</strong> usando
            esses dados, até a chave de API real ser configurada aqui.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Código de serviço padrão" value={form.codigo_servico_padrao} onChange={set("codigo_servico_padrao")} placeholder="Ex: 17.01 - Consultoria" />
          <Campo label="Alíquota de ISS (%)" value={form.aliquota_iss} onChange={set("aliquota_iss")} type="number" />
          <Campo label="Série da NFe" value={form.serie_nfe} onChange={set("serie_nfe")} />
          <Campo label="Próximo número de NFe" value={form.proximo_numero_nfe} onChange={set("proximo_numero_nfe")} type="number" />
          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Ambiente</label>
            <select
              value={form.ambiente_nfe}
              onChange={(e) => set("ambiente_nfe")(e.target.value)}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            >
              <option>Homologação</option>
              <option>Produção</option>
            </select>
          </div>
          <Campo label="Token Focus NFe (quando contratado)" value={form.focus_nfe_token} onChange={set("focus_nfe_token")} placeholder="Ainda não configurado" />
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
        >
          {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar configuração fiscal
        </button>
      </div>
    </div>
  );
}
