"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  titulo: string;
  concluido: boolean;
};

export default function TarefaChecklist({ tarefaId }: { tarefaId: string }) {
  const [itens, setItens] = useState<Item[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    carregar();
  }, [tarefaId]);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("tarefa_checklist_items")
      .select("id, titulo, concluido")
      .eq("tarefa_id", tarefaId)
      .order("ordem", { ascending: true });
    setItens(data ?? []);
    setCarregando(false);
  }

  async function adicionar() {
    if (!novoTitulo.trim()) return;
    setAdicionando(true);
    await supabase.from("tarefa_checklist_items").insert({
      tarefa_id: tarefaId,
      titulo: novoTitulo,
      ordem: itens.length,
    });
    setNovoTitulo("");
    setAdicionando(false);
    carregar();
  }

  async function alternar(item: Item) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, concluido: !i.concluido } : i)));
    await supabase.from("tarefa_checklist_items").update({ concluido: !item.concluido }).eq("id", item.id);
  }

  async function remover(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("tarefa_checklist_items").delete().eq("id", id);
  }

  const concluidos = itens.filter((i) => i.concluido).length;
  const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

  return (
    <div>
      {itens.length > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11.5px] text-[#9aa0ac]">{concluidos} de {itens.length}</span>
            <span className="text-[11.5px] font-semibold text-primary">{progresso}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#f0f1f3] overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      )}

      {carregando ? (
        <div className="flex items-center gap-2 py-3 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {itens.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={item.concluido}
                onChange={() => alternar(item)}
                className="accent-[#004AAD] w-3.5 h-3.5"
              />
              <span className={`text-[12.5px] flex-1 ${item.concluido ? "line-through text-[#c2c6cd]" : "text-[#3f434d]"}`}>
                {item.titulo}
              </span>
              <button onClick={() => remover(item.id)} className="opacity-0 group-hover:opacity-100 text-[#c2c6cd] hover:text-[#f04438]">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2">
        <input
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Adicionar item..."
          className="flex-1 border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <button
          onClick={adicionar}
          disabled={adicionando}
          className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center text-[#5b6270] hover:bg-[#eef0f2] disabled:opacity-60"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
