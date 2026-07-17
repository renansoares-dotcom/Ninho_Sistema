"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { diagnosticoAreas as diagnosticoAreasMock } from "@/lib/mock-data";

type AreaNota = { area: string; nota: number };

export default function DiagnosticoRadarChart({ data }: { data?: AreaNota[] }) {
  const dados = data && data.length > 0 ? data : diagnosticoAreasMock;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={dados}>
        <PolarGrid stroke="#eef0f2" />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 12, fill: "#5b6270" }} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: "#c2c6cd" }} />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)} / 10`, "Nota"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }}
        />
        <Radar
          dataKey="nota"
          stroke="#004AAD"
          strokeWidth={2}
          fill="#004AAD"
          fillOpacity={0.18}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
