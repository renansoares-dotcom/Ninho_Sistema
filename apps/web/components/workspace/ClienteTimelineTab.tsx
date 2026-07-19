"use client";

import { useEffect, useState } from "react";
import { CalendarDays, KanbanSquare, Stethoscope, Wallet, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

type EventoTimeline = {
  id: string;
  tipo: "evento" | "tarefa" | "diagnostico" | "contrato" | "visita";
  titulo: string;
  descricao: string;
  data: string;
};

const iconePorTipo: Record<string, any> = {
  evento: CalendarDays,
  tarefa: KanbanSquare,
  diagnostico: Stethoscope,
  contrato: Wallet,
  visita: MapPin,
};

const corPorTipo: Record<string, string> = {
  evento: "bg-[#eaf1fb] text-primary",
  tarefa: "bg-[#f3e8fd] text-[#9333ea]",
  diagnostico: "bg-[#fff6e6] text-[#b45309]",
  contrato: "bg-[#eafaf1] text-[#0e9f6e]",
  visita: "bg-[#eaf1fb] text-primary",
};

export default function ClienteTimelineTab({ clienteId }: { clienteId: string }) {
  const [itens, setItens] = useState<EventoTimeline[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [eventos, tarefas, diagnosticos, contratos, visitas] = await Promise.all([
        supabase.from("eventos").select("id, titulo, tipo, data_inicio").eq("cliente_id", clienteId),
        supabase.from("tarefas").select("id, titulo, coluna, created_at").eq("cliente_id", clienteId),
        supabase.from("diagnosticos").select("id, data, status").eq("cliente_id", clienteId),
        supabase.from("contratos").select("id, valor_total, data_inicio").eq("cliente_id", clienteId),
        supabase.from("visitas").select("id, data, objetivo").eq("cliente_id", clienteId),
      ]);

      const lista: EventoTimeline[] = [
        ...(eventos.data ?? []).map((e) => ({
          id: e.id,
          tipo: "evento" as const,
          titulo: e.titulo,
          descricao: "Evento na agenda",
          data: e.data_inicio,
        })),
        ...(tarefas.data ?? []).map((t) => ({
          id: t.id,
          tipo: "tarefa" as const,
          titulo: t.titulo,
          descricao: `Tarefa criada — coluna: ${t.coluna}`,
          data: t.created_at,
        })),
        ...(diagnosticos.data ?? []).map((d) => ({
          id: d.id,
          tipo: "diagnostico" as const,
          titulo: `Diagnóstico — ${d.status}`,
          descricao: "Diagnóstico empresarial",
          data: d.data,
        })),
        ...(contratos.data ?? []).map((c) => ({
          id: c.id,
          tipo: "contrato" as const,
          titulo: `Contrato assinado — R$ ${c.valor_total.toLocaleString("pt-BR")}`,
          descricao: "Financeiro",
          data: c.data_inicio,
        })),
        ...(visitas.data ?? []).map((v) => ({
          id: v.id,
          tipo: "visita" as const,
          titulo: v.objetivo ?? "Visita técnica registrada",
          descricao: "Registro de visita",
          data: v.data,
        })),
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      setItens(lista);
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando timeline...
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="py-14 text-center text-[13.5px] text-[#9aa0ac]">
        Nenhuma atividade registrada ainda para este cliente.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {itens.map((item, i) => {
        const Icon = iconePorTipo[item.tipo];
        return (
          <div key={`${item.tipo}-${item.id}`} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${corPorTipo[item.tipo]}`}>
                <Icon size={14} />
              </div>
              {i < itens.length - 1 && <div className="w-px flex-1 bg-[#eef0f2] my-1" />}
            </div>
            <div className="pb-6 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-[#16181d]">{item.titulo}</span>
                <span className="text-[12px] text-[#9aa0ac] shrink-0">
                  {new Date(item.data).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="text-[12.5px] text-[#767c88] mt-0.5">{item.descricao}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
