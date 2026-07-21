"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, X, List, Calendar as CalendarIcon, Loader2, CalendarRange, Sun } from "lucide-react";
import AgendaList from "./AgendaList";
import AgendaCalendar from "./AgendaCalendar";
import AgendaSemana from "./AgendaSemana";
import AgendaDia from "./AgendaDia";
import EventoFormModal, { EventoFormData } from "./EventoFormModal";
import { supabase } from "@/lib/supabase";

export type EventoAgenda = {
  id: string;
  titulo: string;
  tipo: string;
  tipoRaw: string;
  cliente_id: string | null;
  dataISO: string;
  hora: string;
  horaRaw: string;
  resp: string;
};

const tipoDisplay: Record<string, string> = {
  reuniao: "Reunião",
  visita_tecnica: "Visita técnica",
  videoconferencia: "Videoconferência",
};

export default function AgendaView({ refreshKey = 0 }: { refreshKey?: number }) {
  const [modo, setModo] = useState<"lista" | "calendario" | "semana" | "dia">("calendario");
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoFormData | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("eventos")
        .select("id, titulo, tipo, data_inicio, responsavel_nome, cliente_id")
        .order("data_inicio", { ascending: true });

      if (error) {
        setErro(error.message);
      } else {
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
      }
      setCarregando(false);
    }
    carregar();
  }, [refreshKey, internalRefresh]);

  function abrirEdicao(ev: EventoAgenda) {
    setEventoSelecionado({
      id: ev.id,
      titulo: ev.titulo,
      tipo: ev.tipoRaw,
      cliente_id: ev.cliente_id ?? "",
      data: ev.dataISO,
      hora: ev.horaRaw,
      responsavel_nome: ev.resp,
    });
    setModalAberto(true);
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[260px]">
          <Search size={14} color="#9aa0ac" />
          <span className="text-[12.5px] text-[#9aa0ac]">Buscar evento, cliente...</span>
        </div>
        {["Todos os tipos", "Todos os consultores", "Todas as prioridades"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]"
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]">
          <X size={13} />
          Limpar
        </button>

        <div className="ml-auto flex items-center bg-[#f5f6f8] rounded-lg p-1 gap-1">
          <button
            onClick={() => setModo("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "lista" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <List size={13} />
            Lista
          </button>
          <button
            onClick={() => setModo("dia")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "dia" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <Sun size={13} />
            Dia
          </button>
          <button
            onClick={() => setModo("semana")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "semana" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <CalendarRange size={13} />
            Semana
          </button>
          <button
            onClick={() => setModo("calendario")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
              modo === "calendario" ? "bg-white text-primary shadow-sm" : "text-[#767c88]"
            }`}
          >
            <CalendarIcon size={13} />
            Mês
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">
          Não foi possível carregar a agenda: {erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" />
          Carregando agenda do banco de dados...
        </div>
      ) : modo === "lista" ? (
        <AgendaList eventos={eventos} onEventClick={abrirEdicao} />
      ) : modo === "dia" ? (
        <AgendaDia eventos={eventos} onEventClick={abrirEdicao} />
      ) : modo === "semana" ? (
        <AgendaSemana eventos={eventos} onEventClick={abrirEdicao} />
      ) : (
        <AgendaCalendar eventos={eventos} onEventClick={abrirEdicao} />
      )}

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
