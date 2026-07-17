"use client";

import { useState, useMemo } from "react";
import Card from "@/components/shared/Card";
import { areasDiagnostico } from "@/lib/mock-data";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function DiagnosticoForm() {
  const [notas, setNotas] = useState<Record<string, number>>(
    Object.fromEntries(areasDiagnostico.map((a) => [a.area, 5]))
  );

  const dadosRadar = useMemo(
    () => areasDiagnostico.map((a) => ({ area: a.area, nota: notas[a.area] })),
    [notas]
  );

  const indiceGeral = useMemo(() => {
    const valores = Object.values(notas);
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }, [notas]);

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.3fr_1fr] gap-3.5 items-start">
      <div className="flex flex-col gap-3.5">
        {areasDiagnostico.map((a) => (
          <Card key={a.area} title={a.area}>
            <div className="flex flex-col gap-4">
              {a.perguntas.map((p, i) => (
                <p key={i} className="text-[13px] text-[#3f434d] leading-relaxed">
                  {p}
                </p>
              ))}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[#9aa0ac]">Nota geral da área</span>
                  <span className="text-[13px] font-semibold text-primary">{notas[a.area].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={notas[a.area]}
                  onChange={(e) =>
                    setNotas((prev) => ({ ...prev, [a.area]: Number(e.target.value) }))
                  }
                  className="w-full accent-[#004AAD]"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky top-[76px] flex flex-col gap-3.5">
        <Card title="Índice geral de maturidade">
          <div className="text-3xl font-bold text-primary mb-1">{indiceGeral.toFixed(1)} / 10</div>
          <p className="text-[12.5px] text-[#9aa0ac]">
            Calculado automaticamente a partir da média das {areasDiagnostico.length} áreas avaliadas.
          </p>
        </Card>

        <Card title="Radar por área">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dadosRadar}>
              <PolarGrid stroke="#eef0f2" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 10.5, fill: "#5b6270" }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9, fill: "#c2c6cd" }} />
              <Radar dataKey="nota" stroke="#004AAD" strokeWidth={2} fill="#004AAD" fillOpacity={0.18} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <button className="w-full py-3 rounded-lg bg-primary text-white text-[13.5px] font-semibold shadow-sm">
          Concluir diagnóstico
        </button>
      </div>
    </div>
  );
}
