"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";
import KpiFormModal from "@/components/shared/KpiFormModal";

type KpiValor = { id: string; data_referencia: string; valor: number; tipo: string };
type Kpi = { id: string; nome: string; unidade: string | null; valores: KpiValor[] };

export default function ClienteKpisTab({ clienteId }: { clienteId: string }) {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaLeitura, setNovaLeitura] = useState<Record<string, string>>({});
  const [salvandoLeitura, setSalvandoLeitura] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
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
  }, [clienteId, internalRefresh]);

  async function adicionarLeitura(kpiId: string) {
    const valor = novaLeitura[kpiId];
    if (!valor) return;
    setSalvandoLeitura(kpiId);
    await supabase.from("kpi_valores").insert({
      kpi_id: kpiId,
      data_referencia: new Date().toISOString().slice(0, 10),
      valor: Number(valor),
      tipo: "atual",
    });
    setNovaLeitura((prev) => ({ ...prev, [kpiId]: "" }));
    setSalvandoLeitura(null);
    setInternalRefresh((k) => k + 1);
  }

  async function excluirKpi(kpiId: string, nome: string) {
    if (!confirm(`Excluir o indicador "${nome}" e todo o histórico dele?`)) return;
    await supabase.from("kpi_valores").delete().eq("kpi_id", kpiId);
    await supabase.from("kpi_definicoes").delete().eq("id", kpiId);
    setInternalRefresh((k) => k + 1);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Novo indicador
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#16181d]">{kpi.nome}</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">{kpi.unidade}</div>
                </div>
                <button onClick={() => excluirKpi(kpi.id, kpi.nome)} className="text-[#c2c6cd] hover:text-[#f04438]">
                  <Trash2 size={14} />
                </button>
              </div>

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

              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="number"
                  value={novaLeitura[kpi.id] ?? ""}
                  onChange={(e) => setNovaLeitura((prev) => ({ ...prev, [kpi.id]: e.target.value }))}
                  placeholder="Nova leitura..."
                  className="flex-1 border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
                />
                <button
                  onClick={() => adicionarLeitura(kpi.id)}
                  disabled={salvandoLeitura === kpi.id}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#f5f6f8] text-[#5b6270] hover:bg-[#eef0f2] disabled:opacity-60"
                >
                  {salvandoLeitura === kpi.id ? <Loader2 size={12} className="animate-spin" /> : "Adicionar"}
                </button>
              </div>
            </div>
          );
        })}
        {kpis.length === 0 && (
          <div className="col-span-2 py-14 text-center text-[13.5px] text-[#9aa0ac]">
            Nenhum indicador cadastrado ainda para este cliente.
          </div>
        )}
      </div>

      <KpiFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        clienteId={clienteId}
      />
    </div>
  );
}
