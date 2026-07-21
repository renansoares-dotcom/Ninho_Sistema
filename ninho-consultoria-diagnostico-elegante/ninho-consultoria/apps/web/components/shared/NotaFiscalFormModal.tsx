"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Info, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

type ClienteOpcao = {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: any;
  email_nfe: string | null;
};

type ContratoOpcao = { id: string; valor_total: number };

function gerarChaveSimulada() {
  return Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join("");
}

export default function NotaFiscalFormModal({
  open,
  onClose,
  onEmitida,
}: {
  open: boolean;
  onClose: () => void;
  onEmitida: () => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<ClienteOpcao[]>([]);
  const [contratoId, setContratoId] = useState("");
  const [contratos, setContratos] = useState<ContratoOpcao[]>([]);
  const [valor, setValor] = useState("");
  const [descricaoServico, setDescricaoServico] = useState("");
  const [dataEmissao, setDataEmissao] = useState(() => new Date().toISOString().slice(0, 10));
  const [emitindo, setEmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [configFiscal, setConfigFiscal] = useState<{
    codigo_servico_padrao: string | null;
    aliquota_iss: number | null;
    serie_nfe: string | null;
    proximo_numero_nfe: number | null;
    ambiente_nfe: string | null;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setClienteId("");
    setContratoId("");
    setValor("");
    setDescricaoServico("");
    setDataEmissao(new Date().toISOString().slice(0, 10));
    setErro(null);

    supabase
      .from("clientes")
      .select("id, nome_fantasia, razao_social, cnpj, endereco, email_nfe")
      .order("nome_fantasia")
      .then(({ data }) => {
        setClientes(
          (data ?? []).map((c) => ({
            id: c.id,
            nome: c.nome_fantasia ?? c.razao_social,
            cnpj: c.cnpj,
            endereco: c.endereco,
            email_nfe: c.email_nfe,
          }))
        );
      });

    supabase
      .from("configuracoes_empresa")
      .select("codigo_servico_padrao, aliquota_iss, serie_nfe, proximo_numero_nfe, ambiente_nfe")
      .eq("tenant_id", TENANT_ID)
      .maybeSingle()
      .then(({ data }) => setConfigFiscal(data));
  }, [open]);

  useEffect(() => {
    if (!clienteId) {
      setContratos([]);
      setContratoId("");
      return;
    }
    supabase
      .from("contratos")
      .select("id, valor_total")
      .eq("cliente_id", clienteId)
      .then(({ data }) => setContratos(data ?? []));
  }, [clienteId]);

  if (!open) return null;

  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  function selecionarContrato(id: string) {
    setContratoId(id);
    const contrato = contratos.find((c) => c.id === id);
    if (contrato) setValor(String(contrato.valor_total));
  }

  async function emitir() {
    if (!clienteId || !valor) {
      setErro("Selecione o cliente e informe o valor do serviço.");
      return;
    }
    setEmitindo(true);
    setErro(null);

    // Simula latência de chamada à API do Focus NFe
    await new Promise((r) => setTimeout(r, 900));

    const numero = configFiscal?.proximo_numero_nfe ?? 1;

    const { error } = await supabase.from("notas_fiscais").insert({
      tenant_id: TENANT_ID,
      cliente_id: clienteId,
      contrato_id: contratoId || null,
      numero,
      serie: configFiscal?.serie_nfe ?? "1",
      valor: Number(valor),
      descricao_servico: descricaoServico || configFiscal?.codigo_servico_padrao || "Serviços de consultoria empresarial",
      codigo_servico: configFiscal?.codigo_servico_padrao ?? null,
      aliquota_iss: configFiscal?.aliquota_iss ?? null,
      data_emissao: dataEmissao,
      status: "Emitida",
      ambiente: configFiscal?.ambiente_nfe ?? "Homologação",
      chave_acesso: gerarChaveSimulada(),
    });

    if (error) {
      setEmitindo(false);
      setErro(error.message);
      return;
    }

    // Avança o próximo número de NFe nas configurações
    await supabase
      .from("configuracoes_empresa")
      .update({ proximo_numero_nfe: numero + 1 })
      .eq("tenant_id", TENANT_ID);

    setEmitindo(false);
    onEmitida();
    onClose();
  }

  const clienteIncompleto = clienteSelecionado && (!clienteSelecionado.cnpj || !clienteSelecionado.endereco?.cidade);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white">
          <span className="text-[15px] font-semibold text-[#16181d]">Emitir nota fiscal</span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-2 bg-[#eaf1fb] text-primary rounded-lg px-3 py-2.5 text-[12.5px]">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>Emissão <strong>simulada</strong> — ainda não conectada ao Focus NFe de verdade.</span>
          </div>

          {erro && (
            <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
          )}

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Cliente (tomador do serviço) *</label>
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
            {clienteIncompleto && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-[#b45309]">
                <AlertTriangle size={12} />
                Este cliente está com CNPJ ou endereço incompletos no cadastro.
              </div>
            )}
          </div>

          {contratos.length > 0 && (
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Vincular a um contrato (opcional)</label>
              <select
                value={contratoId}
                onChange={(e) => selecionarContrato(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              >
                <option value="">Nenhum</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    Contrato — R$ {c.valor_total.toLocaleString("pt-BR")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Valor do serviço (R$) *</label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ac] mb-1 block">Data de emissão</label>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">Descrição do serviço</label>
            <textarea
              value={descricaoServico}
              onChange={(e) => setDescricaoServico(e.target.value)}
              rows={3}
              placeholder={configFiscal?.codigo_servico_padrao || "Ex: Prestação de serviços de consultoria empresarial"}
              className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="text-[11.5px] text-[#9aa0ac]">
            Número da nota: <strong>{configFiscal?.proximo_numero_nfe ?? 1}</strong> · Série: <strong>{configFiscal?.serie_nfe ?? "1"}</strong> · Ambiente: <strong>{configFiscal?.ambiente_nfe ?? "Homologação"}</strong>
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
            onClick={emitir}
            disabled={emitindo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-primary text-white disabled:opacity-60"
          >
            {emitindo && <Loader2 size={14} className="animate-spin" />}
            {emitindo ? "Emitindo..." : "Emitir nota (simulada)"}
          </button>
        </div>
      </div>
    </div>
  );
}
