"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import TarefaCard, { Tarefa } from "@/components/shared/TarefaCard";
import TarefaFormModal, { TarefaFormData } from "@/components/shared/TarefaFormModal";
import { colunasKanban } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

function formatarPrazo(data: string | null) {
  if (!data) return "Sem prazo";
  const d = new Date(data + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ClienteKanbanTab({ clienteId, clienteNome }: { clienteId: string; clienteNome: string }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaFormData | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("tarefas")
        .select("id, titulo, coluna, prioridade, data_conclusao, responsavel_nome, cliente_id")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      setTarefas(
        (data ?? []).map((t) => ({
          id: t.id,
          titulo: t.titulo,
          cliente: clienteNome,
          cliente_id: t.cliente_id,
          coluna: t.coluna ?? "afazer",
          prioridade: t.prioridade ?? "Média",
          prazo: formatarPrazo(t.data_conclusao),
          prazoRaw: t.data_conclusao,
          resp: t.responsavel_nome ?? "",
        }))
      );
      setCarregando(false);
    }
    carregar();
  }, [clienteId, internalRefresh]);

  function abrirNova() {
    setTarefaSelecionada({
      titulo: "",
      cliente_id: clienteId,
      coluna: "afazer",
      prioridade: "Média",
      data_conclusao: "",
      responsavel_nome: "",
    });
    setModalAberto(true);
  }

  function abrirEdicao(t: Tarefa) {
    setTarefaSelecionada({
      id: t.id,
      titulo: t.titulo,
      cliente_id: t.cliente_id ?? clienteId,
      coluna: t.coluna,
      prioridade: t.prioridade,
      data_conclusao: t.prazoRaw ?? "",
      responsavel_nome: t.resp,
    });
    setModalAberto(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando tarefas...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={abrirNova}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Nova tarefa
        </button>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-3">
        {colunasKanban.map((col) => {
          const items = tarefas.filter((t) => t.coluna === col.id);
          return (
            <div key={col.id} className="min-w-[240px] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 px-0.5">
                <div className="w-[7px] h-[7px] rounded-full" style={{ background: col.cor }} />
                <span className="text-[12.5px] font-semibold text-[#3f434d]">{col.nome}</span>
                <span className="text-[11.5px] text-[#b0b4bb]">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => (
                  <TarefaCard key={t.id} t={t} onClick={() => abrirEdicao(t)} />
                ))}
                {items.length === 0 && (
                  <div className="border-[1.5px] border-dashed border-[#e4e6ea] rounded-xl py-4 px-2.5 text-center text-xs text-[#c2c6cd]">
                    Sem tarefas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TarefaFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        onDeleted={() => setInternalRefresh((k) => k + 1)}
        tarefaInicial={tarefaSelecionada}
      />
    </div>
  );
}
