"use client";

import { useEffect, useState } from "react";
import { Paperclip, X, Plus, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Anexo = {
  id: string;
  nome: string;
  url: string;
};

export default function TarefaAnexos({ tarefaId }: { tarefaId: string }) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    carregar();
  }, [tarefaId]);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("tarefa_anexos")
      .select("id, nome, url")
      .eq("tarefa_id", tarefaId)
      .order("created_at", { ascending: false });
    setAnexos(data ?? []);
    setCarregando(false);
  }

  async function adicionar() {
    if (!nome.trim() || !url.trim()) return;
    setAdicionando(true);
    await supabase.from("tarefa_anexos").insert({ tarefa_id: tarefaId, nome, url });
    setNome("");
    setUrl("");
    setAdicionando(false);
    carregar();
  }

  async function remover(id: string) {
    setAnexos((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("tarefa_anexos").delete().eq("id", id);
  }

  return (
    <div>
      {carregando ? (
        <div className="flex items-center gap-2 py-3 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {anexos.map((a) => (
            <div key={a.id} className="flex items-center gap-2 group border border-[#eef0f2] rounded-lg px-2.5 py-1.5">
              <Paperclip size={12} className="text-[#9aa0ac] shrink-0" />
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-[12.5px] text-[#3f434d] flex-1 truncate hover:text-primary hover:underline flex items-center gap-1"
              >
                {a.nome}
                <ExternalLink size={10} className="shrink-0" />
              </a>
              <button onClick={() => remover(a.id)} className="opacity-0 group-hover:opacity-100 text-[#c2c6cd] hover:text-[#f04438]">
                <X size={13} />
              </button>
            </div>
          ))}
          {anexos.length === 0 && (
            <p className="text-[12px] text-[#9aa0ac]">Nenhum anexo ainda.</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do anexo"
          className="w-[38%] border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (link do arquivo)"
          className="flex-1 border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <button
          onClick={adicionar}
          disabled={adicionando}
          className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center text-[#5b6270] hover:bg-[#eef0f2] disabled:opacity-60 shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
