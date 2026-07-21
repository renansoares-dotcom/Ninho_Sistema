"use client";

import { useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { supabase } from "@/lib/supabase";

type Comentario = {
  id: string;
  texto: string;
  autor_nome: string | null;
  created_at: string;
};

export default function TarefaComentarios({ tarefaId }: { tarefaId: string }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregar();
  }, [tarefaId]);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("comentarios")
      .select("id, texto, autor_nome, created_at")
      .eq("entidade_tipo", "tarefa")
      .eq("entidade_id", tarefaId)
      .order("created_at", { ascending: true });
    setComentarios(data ?? []);
    setCarregando(false);
  }

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    // Autor temporário até o login (Supabase Auth) estar implementado.
    await supabase.from("comentarios").insert({
      entidade_tipo: "tarefa",
      entidade_id: tarefaId,
      texto,
      autor_nome: "Consultor",
    });
    setTexto("");
    setEnviando(false);
    carregar();
  }

  return (
    <div>
      {carregando ? (
        <div className="flex items-center gap-2 py-3 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto">
          {comentarios.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar initials={(c.autor_nome ?? "C").slice(0, 2).toUpperCase()} size={22} />
              <div className="flex-1 bg-[#fafbfc] rounded-lg px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-[#16181d]">{c.autor_nome ?? "Consultor"}</span>
                  <span className="text-[10.5px] text-[#9aa0ac]">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#3f434d]">{c.texto}</p>
              </div>
            </div>
          ))}
          {comentarios.length === 0 && (
            <p className="text-[12px] text-[#9aa0ac]">Nenhum comentário ainda.</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2.5">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escreva um comentário..."
          className="flex-1 border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <button
          onClick={enviar}
          disabled={enviando}
          className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center text-[#5b6270] hover:bg-[#eef0f2] disabled:opacity-60"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
