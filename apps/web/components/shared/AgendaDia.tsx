"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Video } from "lucide-react";
import { Avatar } from "./Avatar";
import type { EventoAgenda } from "./AgendaView";

const tipoIcon: Record<string, any> = {
  "Reunião": CalendarDays,
  "Visita técnica": MapPin,
  "Videoconferência": Video,
};

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AgendaDia({
  eventos,
  onEventClick,
}: {
  eventos: EventoAgenda[];
  onEventClick?: (ev: EventoAgenda) => void;
}) {
  const hoje = new Date("2026-07-17T12:00:00");
  const [dia, setDia] = useState(hoje);

  function mudarDia(delta: number) {
    const d = new Date(dia);
    d.setDate(d.getDate() + delta);
    setDia(d);
  }

  const iso = toISO(dia);
  const eventosDoDia = eventos
    .filter((e) => e.dataISO === iso)
    .sort((a, b) => a.horaRaw.localeCompare(b.horaRaw));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => mudarDia(-1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13.5px] font-semibold text-[#16181d]">
          {dia.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </span>
        <button
          onClick={() => mudarDia(1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {eventosDoDia.length === 0 ? (
        <p className="text-[13.5px] text-[#9aa0ac] text-center py-14">Nenhum evento neste dia.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {eventosDoDia.map((ev) => {
            const Icon = tipoIcon[ev.tipo] ?? CalendarDays;
            return (
              <button
                key={ev.id}
                onClick={() => onEventClick?.(ev)}
                className="text-left flex items-start gap-3 bg-white border border-[#eef0f2] rounded-2xl p-4 hover:border-[#d8dce2] transition-colors w-full"
              >
                <div className="w-14 text-[13px] font-semibold text-primary shrink-0 pt-0.5">{ev.hora}</div>
                <div className="w-9 h-9 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
                  <Icon size={16} color="#004AAD" />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-[#16181d]">{ev.titulo}</div>
                  <div className="text-[12px] text-[#9aa0ac] mt-0.5">{ev.tipo}</div>
                </div>
                <Avatar initials={ev.resp || "—"} size={26} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
