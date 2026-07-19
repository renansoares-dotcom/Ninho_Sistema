"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Info } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const perfis = [
  { nome: "Administrador", descricao: "Acesso total ao sistema, incluindo configurações e usuários" },
  { nome: "Diretor", descricao: "Dashboards executivos, financeiro e todos os projetos" },
  { nome: "Coordenador", descricao: "Gestão de uma carteira de consultores e clientes" },
  { nome: "Consultor", descricao: "Seus clientes, agenda, kanban e diagnósticos" },
  { nome: "Financeiro", descricao: "Contratos, parcelas e indicadores financeiros" },
  { nome: "Cliente (Portal)", descricao: "Acesso somente aos próprios dados, via portal dedicado" },
];

type Config = {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_municipal: string;
  inscricao_estadual: string;
  regime_tributario: string;
  logradouro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email_envio_notas: string;
  codigo_servico_padrao: string;
  aliquota_iss: string;
  serie_nfe: string;
  proximo_numero_nfe: string;
  ambiente_nfe: string;
  focus_nfe_token: string;
};

const vazio: Config = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  inscricao_municipal: "",
  inscricao_estadual: "",
  regime_tributario: "",
  logradouro: "",
  cidade: "",
  uf: "",
  cep: "",
  telefone: "",
  email_envio_notas: "",
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

export default function ConfiguracoesPanel() {
  const [form, setForm] = useState<Config>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();

      if (data) {
        setForm({
          razao_social: data.razao_social ?? "",
          nome_fantasia: data.nome_fantasia ?? "",
          cnpj: data.cnpj ?? "",
          inscricao_municipal: data.inscricao_municipal ?? "",
          inscricao_estadual: data.inscricao_estadual ?? "",
          regime_tributario: data.regime_tributario ?? "",
          logradouro: data.logradouro ?? "",
          cidade: data.cidade ?? "",
          uf: data.uf ?? "",
          cep: data.cep ?? "",
          telefone: data.telefone ?? "",
          email_envio_notas: data.email_envio_notas ?? "",
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

  const set = (campo: keyof Config) => (v: string) => {
    setForm((f) => ({ ...f, [campo]: v }));
    setSalvo(false);
  };

  async function salvar() {
    setSalvando(true);
    setErro(null);

    const payload = {
      tenant_id: TENANT_ID,
      razao_social: form.razao_social || null,
      nome_fantasia: form.nome_fantasia || null,
      cnpj: form.cnpj || null,
      inscricao_municipal: form.inscricao_municipal || null,
      inscricao_estadual: form.inscricao_estadual || null,
      regime_tributario: form.regime_tributario || null,
      logradouro: form.logradouro || null,
      cidade: form.cidade || null,
      uf: form.uf || null,
      cep: form.cep || null,
      telefone: form.telefone || null,
      email_envio_notas: form.email_envio_notas || null,
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
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex items-center justify-center gap-2 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
      {erro && (
        <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">{erro}</div>
      )}
      {salvo && (
        <div className="text-[13px] text-[#0e9f6e] bg-[#eafaf1] rounded-lg px-4 py-3">
          Configurações salvas com sucesso.
        </div>
      )}

      <Card title="Identificação da consultoria">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Campo label="Razão social" value={form.razao_social} onChange={set("razao_social")} placeholder="Ninho Consultoria Ltda." />
          </div>
          <Campo label="Nome fantasia" value={form.nome_fantasia} onChange={set("nome_fantasia")} placeholder="Ninho Consultoria" />
          <Campo label="CNPJ" value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
          <Campo label="Inscrição municipal" value={form.inscricao_municipal} onChange={set("inscricao_municipal")} />
          <Campo label="Inscrição estadual" value={form.inscricao_estadual} onChange={set("inscricao_estadual")} />
          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Regime tributário</label>
            <select
              value={form.regime_tributario}
              onChange={(e) => set("regime_tributario")(e.target.value)}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
            >
              <option value="">Selecione...</option>
              <option>MEI</option>
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Endereço">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Campo label="Logradouro" value={form.logradouro} onChange={set("logradouro")} />
          </div>
          <Campo label="CEP" value={form.cep} onChange={set("cep")} />
          <Campo label="Cidade" value={form.cidade} onChange={set("cidade")} />
          <Campo label="UF" value={form.uf} onChange={set("uf")} placeholder="PE" />
        </div>
      </Card>

      <Card title="Contato">
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Telefone" value={form.telefone} onChange={set("telefone")} />
          <Campo label="E-mail para envio de notas fiscais" value={form.email_envio_notas} onChange={set("email_envio_notas")} type="email" />
        </div>
      </Card>

      <Card title="Emissão de notas fiscais (Focus NFe)">
        <div className="flex items-start gap-2 mb-4 bg-[#eaf1fb] text-primary rounded-lg px-3 py-2.5 text-[12.5px]">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            A integração com o Focus NFe ainda não foi contratada — o módulo de Faturamento vai <strong>simular</strong> a emissão
            usando esses dados, até a chave de API real ser configurada aqui.
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

      <Card title="Perfis de acesso">
        <div className="flex flex-col divide-y divide-[#f2f3f5]">
          {perfis.map((p) => (
            <div key={p.nome} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-semibold text-[#16181d]">{p.nome}</div>
                <div className="text-[12.5px] text-[#767c88] mt-0.5">{p.descricao}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
        >
          {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar configurações
        </button>
      </div>
    </div>
  );
}
