"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import AgendaList from "@/components/shared/AgendaList";
import EventoFormModal, { EventoFormData } from "@/components/shared/EventoFormModal";
import type { EventoAgenda } from "@/components/shared/AgendaView";
import { supabase } from "@/lib/supabase";

const tipoDisplay: Record<string, string> = {
  reuniao: "Reunião",
  visita_tecnica: "Visita técnica",
  videoconferencia: "Videoconferência",
};

export default function ClienteAgendaTab({ clienteId }: { clienteId: string }) {
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoFormData | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("eventos")
        .select("id, titulo, tipo, data_inicio, responsavel_nome, cliente_id")
        .eq("cliente_id", clienteId)
        .order("data_inicio", { ascending: true });

      setEventos(
        (data ?? []).map((e) => {
          const dt = new Date(e.data_inicio);
          return {
            id: e.id,
            titulo: e.titulo,
            tipo: tipoDisplay[e.tipo] ?? e.tipo,
            tipoRaw: e.tipo,
            cliente_id: e.cliente_id,
            dataISO: e.data_inicio.slice(0, 10),
            hora: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            horaRaw: e.data_inicio.slice(11, 16),
            resp: e.responsavel_nome ?? "",
          };
        })
      );
      setCarregando(false);
    }
    carregar();
  }, [clienteId, internalRefresh]);

  function abrirNovo() {
    setEventoSelecionado({
      titulo: "",
      tipo: "reuniao",
      cliente_id: clienteId,
      data: "",
      hora: "09:00",
      responsavel_nome: "",
    });
    setModalAberto(true);
  }

  function abrirEdicao(ev: EventoAgenda) {
    setEventoSelecionado({
      id: ev.id,
      titulo: ev.titulo,
      tipo: ev.tipoRaw,
      cliente_id: ev.cliente_id ?? clienteId,
      data: ev.dataISO,
      hora: ev.horaRaw,
      responsavel_nome: ev.resp,
    });
    setModalAberto(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando agenda...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={abrirNovo}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Novo evento
        </button>
      </div>

      <AgendaList eventos={eventos} onEventClick={abrirEdicao} />

      <EventoFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        onDeleted={() => setInternalRefresh((k) => k + 1)}
        eventoInicial={eventoSelecionado}
      />
    </div>
  );
}
