"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Video } from "lucide-react";
import type { EventoAgenda } from "./AgendaView";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const tipoIcon: Record<string, any> = {
  "Reunião": CalendarDays,
  "Visita técnica": MapPin,
  "Videoconferência": Video,
};

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AgendaSemana({
  eventos,
  onEventClick,
}: {
  eventos: EventoAgenda[];
  onEventClick?: (ev: EventoAgenda) => void;
}) {
  const hoje = new Date("2026-07-17T12:00:00");
  const [inicioSemana, setInicioSemana] = useState(() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const dias = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [inicioSemana]);

  function mudarSemana(delta: number) {
    const d = new Date(inicioSemana);
    d.setDate(d.getDate() + delta * 7);
    setInicioSemana(d);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => mudarSemana(-1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13.5px] font-semibold text-[#16181d]">
          {dias[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — {dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
        <button
          onClick={() => mudarSemana(1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {dias.map((dia, i) => {
          const iso = toISO(dia);
          const eventosDoDia = eventos.filter((e) => e.dataISO === iso).sort((a, b) => a.horaRaw.localeCompare(b.horaRaw));
          const isHoje = iso === toISO(hoje);
          return (
            <div key={iso} className="flex flex-col gap-1.5">
              <div className={`text-center py-1.5 rounded-lg ${isHoje ? "bg-[#eaf1fb]" : ""}`}>
                <div className="text-[10.5px] text-[#9aa0ac]">{diasSemana[i].slice(0, 3)}</div>
                <div className={`text-[14px] font-semibold ${isHoje ? "text-primary" : "text-[#16181d]"}`}>
                  {dia.getDate()}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 min-h-[120px]">
                {eventosDoDia.map((ev) => {
                  const Icon = tipoIcon[ev.tipo] ?? CalendarDays;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick?.(ev)}
                      className="text-left bg-white border border-[#eef0f2] rounded-lg p-2 hover:border-[#d8dce2] transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon size={10} color="#004AAD" />
                        <span className="text-[10px] text-[#9aa0ac]">{ev.hora}</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#16181d] leading-tight line-clamp-2">
                        {ev.titulo}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
