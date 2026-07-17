"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import TarefaCard, { Tarefa } from "./TarefaCard";
import { colunasKanban } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

function formatarPrazo(data: string | null) {
  if (!data) return "Sem prazo";
  const d = new Date(data + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function KanbanBoard() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("tarefas")
        .select("id, titulo, coluna, prioridade, data_conclusao, responsavel_nome, clientes(nome_fantasia, razao_social)")
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message);
      } else {
        setTarefas(
          (data ?? []).map((t: any) => ({
            id: t.id,
            titulo: t.titulo,
            cliente: t.clientes?.nome_fantasia ?? t.clientes?.razao_social ?? "—",
            coluna: t.coluna ?? "afazer",
            prioridade: t.prioridade ?? "Média",
            prazo: formatarPrazo(t.data_conclusao),
            resp: t.responsavel_nome ?? "",
          }))
        );
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[260px]">
          <Search size={14} color="#9aa0ac" />
          <span className="text-[12.5px] text-[#9aa0ac]">Buscar tarefa ou cliente...</span>
        </div>
        {["Responsável", "Cliente", "Prioridade"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]"
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
      </div>

      {erro && (
        <div className="mb-4 text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">
          Não foi possível carregar as tarefas: {erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" />
          Carregando tarefas do banco de dados...
        </div>
      ) : (
        <div className="flex gap-3.5 overflow-x-auto pb-3">
          {colunasKanban.map((col) => {
            const items = tarefas.filter((t) => t.coluna === col.id);
            return (
              <div key={col.id} className="min-w-[260px] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-0.5">
                  <div className="w-[7px] h-[7px] rounded-full" style={{ background: col.cor }} />
                  <span className="text-[12.5px] font-semibold text-[#3f434d]">{col.nome}</span>
                  <span className="text-[11.5px] text-[#b0b4bb]">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <TarefaCard key={t.id} t={t} />
                  ))}
                  {items.length === 0 && (
                    <div className="border-[1.5px] border-dashed border-[#e4e6ea] rounded-xl py-4.5 px-2.5 text-center text-xs text-[#c2c6cd]">
                      Sem tarefas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
