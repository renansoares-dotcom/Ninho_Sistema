"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { receitaMensal, funilData } from "@/lib/mock-data";

export function ReceitaChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={receitaMensal} margin={{ left: -20, right: 4 }}>
        <defs>
          <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e9f6e" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0e9f6e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f0f1f3" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9aa0ac" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#9aa0ac" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(v: number) => [`R$ ${v} mil`, "Receita"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }}
        />
        <Area type="monotone" dataKey="valor" stroke="#0e9f6e" strokeWidth={2.4} fill="url(#receitaGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FunilChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={funilData} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="etapa"
          type="category"
          tick={{ fontSize: 12, fill: "#5b6270" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(v: number) => [`${v} oportunidades`, ""]}
          contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }}
        />
        <Bar dataKey="qtd" fill="#0e9f6e" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
