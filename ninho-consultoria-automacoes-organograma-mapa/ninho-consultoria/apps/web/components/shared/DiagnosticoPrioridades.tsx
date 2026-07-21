import { AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";

type AreaNota = { area: string; nota: number };

function classificar(nota: number) {
  if (nota < 5.5) return { label: "Prioridade alta", icon: AlertOctagon, color: "#f04438" };
  if (nota < 7.5) return { label: "Prioridade média", icon: AlertTriangle, color: "#b45309" };
  return { label: "Estável", icon: CheckCircle2, color: "#0e9f6e" };
}

export default function DiagnosticoPrioridades({ areas }: { areas: AreaNota[] }) {
  const ordenadas = [...areas].sort((a, b) => a.nota - b.nota);

  return (
    <div className="flex flex-col gap-2">
      {ordenadas.map((a, i) => {
        const c = classificar(a.nota);
        const Icon = c.icon;
        return (
          <div key={a.area} className="flex items-center gap-3">
            <span className="text-[11px] text-[#c2c6cd] w-4">{i + 1}</span>
            <Icon size={15} color={c.color} className="shrink-0" />
            <span className="text-[13px] text-[#16181d] font-medium flex-1">{a.area}</span>
            <span className="text-[11.5px] font-semibold" style={{ color: c.color }}>
              {c.label}
            </span>
            <span className="text-[12px] text-[#9aa0ac] w-10 text-right">{a.nota.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}
