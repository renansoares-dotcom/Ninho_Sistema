import { CalendarDays, Video, MapPin } from "lucide-react";
import { Avatar } from "./Avatar";
import type { EventoAgenda } from "./AgendaView";

const tipoIcon: Record<string, any> = {
  "Reunião": CalendarDays,
  "Visita técnica": MapPin,
  "Videoconferência": Video,
};

function formatarGrupo(dataISO: string) {
  const hoje = new Date("2026-07-17T12:00:00");
  const d = new Date(dataISO + "T12:00:00");
  const diffDias = Math.round((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Amanhã";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function AgendaList({ eventos }: { eventos: EventoAgenda[] }) {
  const grupos = eventos.reduce<Record<string, EventoAgenda[]>>((acc, ev) => {
    const label = formatarGrupo(ev.dataISO);
    acc[label] = acc[label] || [];
    acc[label].push(ev);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grupos).map(([data, evs]) => (
        <div key={data}>
          <div className="text-[13px] font-semibold text-[#9aa0ac] mb-3">{data}</div>
          <div className="flex flex-col gap-2.5">
            {evs.map((ev) => {
              const Icon = tipoIcon[ev.tipo] ?? CalendarDays;
              return (
                <div
                  key={ev.id}
                  className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
                    <Icon size={18} color="#004AAD" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-[#16181d]">{ev.titulo}</div>
                    <div className="text-[12px] text-[#9aa0ac] mt-0.5">{ev.tipo} · {ev.hora}</div>
                  </div>
                  <Avatar initials={ev.resp || "—"} size={26} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {eventos.length === 0 && (
        <p className="text-[13px] text-[#9aa0ac] text-center py-10">Nenhum evento cadastrado ainda.</p>
      )}
    </div>
  );
}
