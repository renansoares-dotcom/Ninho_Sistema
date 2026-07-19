type AreaNota = { area: string; nota: number };

function corPorNota(nota: number) {
  if (nota >= 7.5) return { bg: "#eafaf1", text: "#0e9f6e", label: "Forte" };
  if (nota >= 5.5) return { bg: "#fff6e6", text: "#b45309", label: "Atenção" };
  return { bg: "#fdecea", text: "#f04438", label: "Crítico" };
}

export default function DiagnosticoHeatmap({ areas }: { areas: AreaNota[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {areas.map((a) => {
        const cor = corPorNota(a.nota);
        return (
          <div
            key={a.area}
            className="rounded-xl p-3 flex flex-col gap-1"
            style={{ background: cor.bg }}
          >
            <span className="text-[12px] font-semibold" style={{ color: cor.text }}>
              {a.area}
            </span>
            <span className="text-[20px] font-bold" style={{ color: cor.text }}>
              {a.nota.toFixed(1)}
            </span>
            <span className="text-[10.5px]" style={{ color: cor.text }}>
              {cor.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
