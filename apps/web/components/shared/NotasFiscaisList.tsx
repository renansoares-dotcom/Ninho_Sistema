"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotaFiscalFormModal from "./NotaFiscalFormModal";
import NotaFiscalDetalheModal, { NotaFiscalDetalhe } from "./NotaFiscalDetalheModal";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const statusStyles: Record<string, string> = {
  Emitida: "bg-[#eafaf1] text-[#0e9f6e]",
  Cancelada: "bg-[#fdecea] text-[#f04438]",
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type NotaRow = {
  id: string;
  numero: number;
  serie: string;
  valor: number;
  descricao_servico: string | null;
  codigo_servico: string | null;
  aliquota_iss: number | null;
  data_emissao: string;
  status: string;
  ambiente: string;
  chave_acesso: string | null;
  clientes: { nome_fantasia: string | null; razao_social: string; cnpj: string | null; endereco: any } | null;
};

export default function NotasFiscaisList() {
  const [notas, setNotas] = useState<NotaRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalEmissaoAberto, setModalEmissaoAberto] = useState(false);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscalDetalhe | undefined>(undefined);
  const [empresa, setEmpresa] = useState<{ razao_social: string | null; cnpj: string | null } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("novo") === "1") {
      setModalEmissaoAberto(true);
    }
  }, []);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: notasData }, { data: empresaData }] = await Promise.all([
        supabase
          .from("notas_fiscais")
          .select("id, numero, serie, valor, descricao_servico, codigo_servico, aliquota_iss, data_emissao, status, ambiente, chave_acesso, clientes(nome_fantasia, razao_social, cnpj, endereco)")
          .order("numero", { ascending: false }),
        supabase.from("configuracoes_empresa").select("razao_social, cnpj").eq("tenant_id", TENANT_ID).maybeSingle(),
      ]);
      setNotas((notasData as any) ?? []);
      setEmpresa(empresaData);
      setCarregando(false);
    }
    carregar();
  }, [internalRefresh]);

  function abrirDetalhe(n: NotaRow) {
    const endereco = n.clientes?.endereco
      ? [n.clientes.endereco.logradouro, n.clientes.endereco.cidade, n.clientes.endereco.uf].filter(Boolean).join(" — ")
      : "—";

    setNotaSelecionada({
      id: n.id,
      numero: n.numero,
      serie: n.serie,
      valor: n.valor,
      descricao_servico: n.descricao_servico,
      codigo_servico: n.codigo_servico,
      aliquota_iss: n.aliquota_iss,
      data_emissao: n.data_emissao,
      status: n.status,
      ambiente: n.ambiente,
      chave_acesso: n.chave_acesso,
      clienteNome: n.clientes?.nome_fantasia ?? n.clientes?.razao_social ?? "—",
      clienteCnpj: n.clientes?.cnpj ?? null,
      clienteEndereco: endereco,
      empresaNome: empresa?.razao_social ?? "Ninho Consultoria",
      empresaCnpj: empresa?.cnpj ?? null,
    });
    setModalDetalheAberto(true);
  }

  const totalEmitido = notas.filter((n) => n.status === "Emitida").reduce((acc, n) => acc + n.valor, 0);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando notas fiscais...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
          <div className="text-[12px] text-[#9aa0ac] mb-1">Notas emitidas</div>
          <div className="text-[20px] font-bold text-[#16181d]">{notas.filter((n) => n.status === "Emitida").length}</div>
        </div>
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
          <div className="text-[12px] text-[#9aa0ac] mb-1">Valor total faturado</div>
          <div className="text-[20px] font-bold text-primary">{formatarMoeda(totalEmitido)}</div>
        </div>
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center justify-center">
          <button
            onClick={() => setModalEmissaoAberto(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white shadow-sm"
          >
            <Plus size={15} />
            Emitir nota fiscal
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Nº</th>
              <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Cliente</th>
              <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Data</th>
              <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Valor</th>
              <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((n) => (
              <tr
                key={n.id}
                onClick={() => abrirDetalhe(n)}
                className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer"
              >
                <td className="px-5 py-3 text-[13px] font-semibold text-[#16181d]">
                  <div className="flex items-center gap-2">
                    <FileText size={13} color="#9aa0ac" />
                    {n.numero}/{n.serie}
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] text-[#3f434d]">
                  {n.clientes?.nome_fantasia ?? n.clientes?.razao_social ?? "—"}
                </td>
                <td className="px-5 py-3 text-[12px] text-[#9aa0ac]">
                  {new Date(n.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3 text-[13px] font-semibold text-primary">{formatarMoeda(n.valor)}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyles[n.status] ?? statusStyles.Emitida}`}>
                    {n.status}
                  </span>
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center text-[13.5px] text-[#9aa0ac]">
                  Nenhuma nota fiscal emitida ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NotaFiscalFormModal
        open={modalEmissaoAberto}
        onClose={() => setModalEmissaoAberto(false)}
        onEmitida={() => setInternalRefresh((k) => k + 1)}
      />

      <NotaFiscalDetalheModal
        open={modalDetalheAberto}
        onClose={() => setModalDetalheAberto(false)}
        onChanged={() => setInternalRefresh((k) => k + 1)}
        nota={notaSelecionada}
      />
    </div>
  );
}
