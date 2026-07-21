"use client";

import { X, Printer, Loader2, Ban } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type NotaFiscalDetalhe = {
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
  clienteNome: string;
  clienteCnpj: string | null;
  clienteEndereco: string;
  empresaNome: string;
  empresaCnpj: string | null;
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function NotaFiscalDetalheModal({
  open,
  onClose,
  onChanged,
  nota,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  nota?: NotaFiscalDetalhe;
}) {
  const [cancelando, setCancelando] = useState(false);

  if (!open || !nota) return null;

  async function cancelarNota() {
    if (!nota) return;
    if (!confirm(`Cancelar a nota fiscal Nº ${nota.numero}? Essa ação não pode ser desfeita.`)) return;
    setCancelando(true);
    await supabase.from("notas_fiscais").update({ status: "Cancelada" }).eq("id", nota.id);
    setCancelando(false);
    onChanged();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[88vh] overflow-y-auto shadow-xl print:shadow-none print:max-w-full print:max-h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2] sticky top-0 bg-white print:hidden">
          <span className="text-[15px] font-semibold text-[#16181d]">Nota Fiscal de Serviço — Nº {nota.numero}</span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 print-area">
          <div className="flex items-center justify-between border-b border-[#eef0f2] pb-4">
            <div>
              <div className="text-[16px] font-bold text-[#16181d]">{nota.empresaNome || "Ninho Consultoria"}</div>
              <div className="text-[12px] text-[#9aa0ac]">CNPJ: {nota.empresaCnpj ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-[#9aa0ac]">NFS-e Nº</div>
              <div className="text-[20px] font-bold text-primary">{nota.numero}/{nota.serie}</div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  nota.status === "Cancelada" ? "bg-[#fdecea] text-[#f04438]" : "bg-[#eafaf1] text-[#0e9f6e]"
                }`}
              >
                {nota.status}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide mb-1.5">Tomador do serviço</div>
            <div className="text-[13.5px] font-medium text-[#16181d]">{nota.clienteNome}</div>
            <div className="text-[12.5px] text-[#767c88]">CNPJ: {nota.clienteCnpj ?? "—"}</div>
            <div className="text-[12.5px] text-[#767c88]">{nota.clienteEndereco}</div>
          </div>

          <div>
            <div className="text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide mb-1.5">Descrição do serviço</div>
            <p className="text-[13px] text-[#3f434d]">{nota.descricao_servico ?? "—"}</p>
            {nota.codigo_servico && (
              <div className="text-[12px] text-[#9aa0ac] mt-1">Código de serviço: {nota.codigo_servico}</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 bg-[#fafbfc] rounded-xl p-4">
            <div>
              <div className="text-[11px] text-[#9aa0ac]">Data de emissão</div>
              <div className="text-[13px] font-semibold text-[#16181d]">
                {new Date(nota.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9aa0ac]">Alíquota ISS</div>
              <div className="text-[13px] font-semibold text-[#16181d]">{nota.aliquota_iss ? `${nota.aliquota_iss}%` : "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9aa0ac]">Valor do serviço</div>
              <div className="text-[15px] font-bold text-primary">{formatarMoeda(nota.valor)}</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#9aa0ac]">Chave de acesso (simulada)</div>
            <div className="text-[11px] font-mono text-[#5b6270] break-all">{nota.chave_acesso}</div>
          </div>

          <div className="text-[10.5px] text-[#c2c6cd] border-t border-[#f2f3f5] pt-3">
            Documento simulado — ambiente de {nota.ambiente}. Não possui valor fiscal até a integração com o Focus NFe ser concluída.
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[#eef0f2] sticky bottom-0 bg-white print:hidden">
          {nota.status !== "Cancelada" ? (
            <button
              onClick={cancelarNota}
              disabled={cancelando}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium border border-[#f5c2bd] text-[#f04438] hover:bg-[#fdecea] disabled:opacity-60"
            >
              {cancelando ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              Cancelar nota
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-primary text-white"
          >
            <Printer size={14} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
