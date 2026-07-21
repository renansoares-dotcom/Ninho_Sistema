"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";
import { usePortal } from "./PortalContext";

type KpiValor = { id: string; data_referencia: string; valor: number; tipo: string };
type Kpi = { id: string; nome: string; unidade: string | null; valores: KpiValor[] };

export default function PortalIndicadores() {
  const { clienteId } = usePortal();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data: definicoes } = await supabase
        .from("kpi_definicoes")
        .select("id, nome, unidade")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: true });

      if (!definicoes || definicoes.length === 0) {
        setKpis([]);
        setCarregando(false);
        return;
      }

      const { data: valores } = await supabase
        .from("kpi_valores")
        .select("id, kpi_id, data_referencia, valor, tipo")
        .in("kpi_id", definicoes.map((d) => d.id))
        .order("data_referencia", { ascending: true });

      setKpis(
        definicoes.map((d) => ({
          id: d.id,
          nome: d.nome,
          unidade: d.unidade,
          valores: (valores ?? []).filter((v) => v.kpi_id === d.id),
        }))
      );
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  return (
    <div className="max-w-[1100px] mx-auto px-7 py-7 flex flex-col gap-4">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Indicadores</h1>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : kpis.length === 0 ? (
        <div className="bg-white border border-[#eef0f2] rounded-2xl py-16 text-center text-[13.5px] text-[#9aa0ac]">
          Nenhum indicador acompanhado ainda para sua empresa.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const baseline = kpi.valores.find((v) => v.tipo === "baseline");
            const leiturasAtuais = kpi.valores.filter((v) => v.tipo === "atual");
            const ultimaLeitura = leiturasAtuais[leiturasAtuais.length - 1];
            const referencia = ultimaLeitura ?? baseline;
            const variacao = baseline && ultimaLeitura
              ? ((ultimaLeitura.valor - baseline.valor) / Math.abs(baseline.valor)) * 100
              : null;

            const dadosGrafico = [
              ...(baseline ? [{ data: "Início", valor: baseline.valor }] : []),
              ...leiturasAtuais.map((v) => ({
                data: new Date(v.data_referencia + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                valor: v.valor,
              })),
            ];

            return (
              <div key={kpi.id} className="bg-white border border-[#eef0f2] rounded-2xl p-4">
                <div className="text-[13.5px] font-semibold text-[#16181d]">{kpi.nome}</div>
                <div className="text-[11.5px] text-[#9aa0ac] mb-2">{kpi.unidade}</div>

                <div className="flex items-end gap-3 mb-3">
                  <div>
                    <div className="text-[10.5px] text-[#9aa0ac]">Início</div>
                    <div className="text-[15px] font-semibold text-[#767c88]">{baseline?.valor ?? "—"}</div>
                  </div>
                  <div className="text-[#c2c6cd] pb-1">→</div>
                  <div>
                    <div className="text-[10.5px] text-[#9aa0ac]">Atual</div>
                    <div className="text-[18px] font-bold text-[#16181d]">{referencia?.valor ?? "—"}</div>
                  </div>
                  {variacao !== null && (
                    <span className={`flex items-center gap-0.5 text-[12px] font-semibold mb-1 ${variacao >= 0 ? "text-[#0e9f6e]" : "text-[#f04438]"}`}>
                      {variacao >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(variacao).toFixed(1)}%
                    </span>
                  )}
                </div>

                {dadosGrafico.length > 1 && (
                  <ResponsiveContainer width="100%" height={90}>
                    <LineChart data={dadosGrafico}>
                      <XAxis dataKey="data" tick={{ fontSize: 10, fill: "#9aa0ac" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eef0f2", fontSize: 11.5 }} />
                      <Line type="monotone" dataKey="valor" stroke="#004AAD" strokeWidth={2} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
