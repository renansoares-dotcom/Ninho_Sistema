"use client";

import { useEffect, useState } from "react";
import { Paperclip, X, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { abrirArquivoPrivado } from "@/lib/storage";
import Dropzone from "./Dropzone";

const BUCKET = "arquivos";

type Anexo = {
  id: string;
  nome: string;
  caminho: string | null;
};

export default function TarefaAnexos({ tarefaId }: { tarefaId: string }) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, [tarefaId]);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("tarefa_anexos")
      .select("id, nome, caminho")
      .eq("tarefa_id", tarefaId)
      .order("created_at", { ascending: false });
    setAnexos(data ?? []);
    setCarregando(false);
  }

  async function enviarArquivos(files: FileList) {
    setEnviando(true);
    setErro(null);

    for (const file of Array.from(files)) {
      const caminho = `tarefas/${tarefaId}/${Date.now()}-${file.name}`;
      const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(caminho, file);

      if (erroUpload) {
        setErro(erroUpload.message);
        continue;
      }

      const { error: erroInsert } = await supabase.from("tarefa_anexos").insert({
        tarefa_id: tarefaId,
        nome: file.name,
        caminho,
      });

      if (erroInsert) setErro(erroInsert.message);
    }

    setEnviando(false);
    carregar();
  }

  async function remover(id: string) {
    setAnexos((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("tarefa_anexos").delete().eq("id", id);
  }

  return (
    <div>
      {erro && (
        <div className="text-[11.5px] text-[#f04438] bg-[#fdecea] rounded-lg px-2.5 py-1.5 mb-2">{erro}</div>
      )}

      {carregando ? (
        <div className="flex items-center gap-2 py-3 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {anexos.map((a) => (
            <div key={a.id} className="flex items-center gap-2 group border border-[#eef0f2] rounded-lg px-2.5 py-1.5">
              <Paperclip size={12} className="text-[#9aa0ac] shrink-0" />
              <button
                onClick={() => abrirArquivoPrivado(a.caminho)}
                className="text-[12.5px] text-[#3f434d] flex-1 truncate hover:text-primary hover:underline flex items-center gap-1 text-left"
              >
                {a.nome}
                <ExternalLink size={10} className="shrink-0" />
              </button>
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

      <div className="mt-2">
        <Dropzone onFiles={enviarArquivos} disabled={enviando} compact label={enviando ? "Enviando..." : undefined} />
      </div>
    </div>
  );
}
