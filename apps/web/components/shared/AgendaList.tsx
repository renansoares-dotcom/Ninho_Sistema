import { CalendarDays, Video, MapPin } from "lucide-react";
import { Avatar } from "./Avatar";
import { eventosAgenda } from "@/lib/mock-data";

const tipoIcon: Record<string, any> = {
  "Reunião": CalendarDays,
  "Visita técnica": MapPin,
  "Videoconferência": Video,
};

export default function AgendaList() {
  const grupos = eventosAgenda.reduce<Record<string, typeof eventosAgenda>>((acc, ev) => {
    acc[ev.data] = acc[ev.data] || [];
    acc[ev.data].push(ev);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grupos).map(([data, eventos]) => (
        <div key={data}>
          <div className="text-[13px] font-semibold text-[#9aa0ac] mb-3">{data}</div>
          <div className="flex flex-col gap-2.5">
            {eventos.map((ev) => {
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
                  <Avatar initials={ev.resp} size={26} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
