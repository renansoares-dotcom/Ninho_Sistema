"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Upload,
  Star,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const BUCKET = "arquivos";

const categorias = ["Geral", "Diagnóstico", "Contrato", "Visita", "Financeiro", "Relatório"];

type Arquivo = {
  id: string;
  nome: string;
  url: string;
  categoria: string | null;
  favorito: boolean;
  tamanho: number | null;
  tipo_arquivo: string | null;
  created_at: string;
  clientes?: { nome_fantasia: string | null; razao_social: string } | null;
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

export default function ArquivosPanel({ clienteId }: { clienteId?: string }) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregar();
  }, [clienteId]);

  async function carregar() {
    setCarregando(true);
    let sel = supabase
      .from("arquivos")
      .select("id, nome, url, categoria, favorito, tamanho, tipo_arquivo, created_at, clientes(nome_fantasia, razao_social)")
      .order("created_at", { ascending: false });

    if (clienteId) sel = sel.eq("cliente_id", clienteId);

    const { data, error } = await sel;
    if (error) setErro(error.message);
    setArquivos((data as any) ?? []);
    setCarregando(false);
  }

  async function enviarArquivo(file: File) {
    setEnviando(true);
    setErro(null);

    const caminho = `${clienteId ?? "geral"}/${Date.now()}-${file.name}`;
    const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(caminho, file);

    if (erroUpload) {
      setErro(erroUpload.message);
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

    const { error: erroInsert } = await supabase.from("arquivos").insert({
      tenant_id: TENANT_ID,
      nome: file.name,
      url: urlData.publicUrl,
      categoria: "Geral",
      cliente_id: clienteId ?? null,
      tamanho: file.size,
      tipo_arquivo: file.type,
    });

    setEnviando(false);

    if (erroInsert) {
      setErro(erroInsert.message);
      return;
    }

    carregar();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) enviarArquivo(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function alternarFavorito(a: Arquivo) {
    setArquivos((prev) => prev.map((x) => (x.id === a.id ? { ...x, favorito: !x.favorito } : x)));
    await supabase.from("arquivos").update({ favorito: !a.favorito }).eq("id", a.id);
  }

  async function excluir(a: Arquivo) {
    if (!confirm(`Excluir "${a.nome}"?`)) return;
    await supabase.from("arquivos").delete().eq("id", a.id);
    setArquivos((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function atualizarCategoria(a: Arquivo, categoria: string) {
    setArquivos((prev) => prev.map((x) => (x.id === a.id ? { ...x, categoria } : x)));
    await supabase.from("arquivos").update({ categoria }).eq("id", a.id);
  }

  const filtrados = arquivos.filter((a) => {
    const bateQuery = a.nome.toLowerCase().includes(query.toLowerCase());
    const bateCategoria = !categoriaFiltro || a.categoria === categoriaFiltro;
    return bateQuery && bateCategoria;
  });

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[260px]">
          <Search size={14} color="#9aa0ac" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar arquivo..."
            className="bg-transparent outline-none text-[12.5px] text-[#3f434d] placeholder:text-[#9aa0ac] w-full"
          />
        </div>

        <div className="relative">
          <select
            value={categoriaFiltro ?? ""}
            onChange={(e) => setCategoriaFiltro(e.target.value || null)}
            className="appearance-none px-3 py-2 pr-7 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270] outline-none"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa0ac]" />
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
        >
          {enviando ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Enviar arquivo
        </button>
        <input ref={inputRef} type="file" onChange={onFileChange} className="hidden" />
      </div>

      {erro && (
        <div className="mb-4 text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">{erro}</div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" />
          Carregando arquivos...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtrados.map((a) => {
            const Icon = iconePorTipo(a.tipo_arquivo);
            return (
              <div
                key={a.id}
                className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
                    <Icon size={17} color="#004AAD" />
                  </div>
                  <button onClick={() => alternarFavorito(a)} className="text-[#c2c6cd] hover:text-[#f59e0b]">
                    <Star size={16} className={a.favorito ? "fill-[#f59e0b] text-[#f59e0b]" : ""} />
                  </button>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#16181d] truncate">{a.nome}</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">
                    {formatarTamanho(a.tamanho)} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  {!clienteId && a.clientes && (
                    <div className="text-[11px] text-[#9aa0ac] mt-0.5">
                      {a.clientes.nome_fantasia ?? a.clientes.razao_social}
                    </div>
                  )}
                </div>

                <select
                  value={a.categoria ?? "Geral"}
                  onChange={(e) => atualizarCategoria(a, e.target.value)}
                  className="text-[11px] font-medium px-2 py-1 rounded-full bg-[#f5f6f8] text-[#5b6270] outline-none border-none"
                >
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#e4e6ea] text-[12px] font-medium text-[#3f434d] hover:bg-[#f5f6f8]"
                  >
                    <Download size={12} />
                    Abrir
                  </a>
                  <button
                    onClick={() => excluir(a)}
                    className="w-8 h-8 rounded-lg border border-[#f5c2bd] text-[#f04438] flex items-center justify-center hover:bg-[#fdecea] shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && (
            <div className="col-span-3 py-14 text-center text-[13.5px] text-[#9aa0ac]">
              Nenhum arquivo encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
