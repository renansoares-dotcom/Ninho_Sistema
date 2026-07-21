"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mensagem = {
  id: string;
  autor_id: string | null;
  autor_nome: string | null;
  texto: string;
  created_at: string;
};

// Componente compartilhado entre o Workspace interno (aba "Mensagens" do
// cliente) e o Portal do Cliente — ambos os lados conversam na mesma
// tabela "comentarios" (entidade_tipo = 'cliente_mensagem').
export default function MensagensCliente({
  clienteId,
  userId,
  userNome,
}: {
  clienteId: string;
  userId: string;
  userNome: string;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    const { data } = await supabase
      .from("comentarios")
      .select("id, autor_id, autor_nome, texto, created_at")
      .eq("entidade_tipo", "cliente_mensagem")
      .eq("entidade_id", clienteId)
      .order("created_at", { ascending: true });
    setMensagens((data as Mensagem[]) ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, [clienteId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    const { error } = await supabase.from("comentarios").insert({
      entidade_tipo: "cliente_mensagem",
      entidade_id: clienteId,
      autor_id: userId,
      autor_nome: userNome,
      texto: texto.trim(),
    });
    if (!error) {
      setTexto("");
      await carregar();
    }
    setEnviando(false);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando mensagens...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {mensagens.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#9aa0ac] text-center px-8">
            Nenhuma mensagem ainda. Escreva abaixo para começar a conversa.
          </div>
        )}
        {mensagens.map((m) => {
          const minha = m.autor_id === userId;
          return (
            <div key={m.id} className={`flex flex-col ${minha ? "items-end" : "items-start"}`}>
              <span className="text-[11px] text-[#9aa0ac] mb-0.5 px-1">
                {minha ? "Você" : m.autor_nome || "Equipe"} ·{" "}
                {new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                  minha ? "bg-primary text-white rounded-br-sm" : "bg-[#f5f6f8] text-[#16181d] rounded-bl-sm"
                }`}
              >
                {m.texto}
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>
      <div className="border-t border-[#eef0f2] p-3 flex items-end gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          rows={1}
          placeholder="Escreva uma mensagem..."
          className="flex-1 resize-none border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary max-h-[120px]"
        />
        <button
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
