"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { abrirArquivoPrivado } from "@/lib/storage";
import { usePortal } from "./PortalContext";

type Arquivo = {
  id: string;
  nome: string;
  caminho: string | null;
  categoria: string | null;
  tamanho: number | null;
  tipo_arquivo: string | null;
  created_at: string;
};

function iconePorTipo(tipo: string | null) {
  if (!tipo) return FileIcon;
  if (tipo.startsWith("image/")) return ImageIcon;
  if (tipo === "application/pdf") return FileText;
  return FileIcon;
}

function formatarTamanho(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PortalArquivos() {
  const { clienteId } = usePortal();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("arquivos")
        .select("id, nome, caminho, categoria, tamanho, tipo_arquivo, created_at")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      setArquivos((data as Arquivo[]) ?? []);
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  return (
    <div className="max-w-[1100px] mx-auto px-7 py-7 flex flex-col gap-4">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Arquivos</h1>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : arquivos.length === 0 ? (
        <div className="bg-white border border-[#eef0f2] rounded-2xl py-16 text-center text-[13.5px] text-[#9aa0ac]">
          Nenhum arquivo compartilhado com você ainda.
        </div>
      ) : (
        <div className="bg-white border border-[#eef0f2] rounded-2xl divide-y divide-[#f2f3f5]">
          {arquivos.map((a) => {
            const Icon = iconePorTipo(a.tipo_arquivo);
            return (
              <button
                key={a.id}
                onClick={() => abrirArquivoPrivado(a.caminho)}
                className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-[#f7f8fa] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#16181d] truncate">{a.nome}</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">
                    {a.categoria || "Geral"} · {formatarTamanho(a.tamanho)} ·{" "}
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <Download size={15} className="text-[#9aa0ac] shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
