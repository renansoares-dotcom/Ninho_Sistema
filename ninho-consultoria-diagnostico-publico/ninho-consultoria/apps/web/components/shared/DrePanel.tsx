"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function DrePanel() {
  const hoje = new Date("2026-07-17T12:00:00");
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [receitas, setReceitas] = useState<{ valor: number; vencimento: string; status: string }[]>([]);
  const [despesas, setDespesas] = useState<{ valor: number; categoria: string; data: string }[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: parcelasData }, { data: despesasData }] = await Promise.all([
        supabase.from("contrato_parcelas").select("valor, vencimento, status"),
        supabase.from("despesas").select("valor, categoria, data"),
      ]);
      setReceitas(parcelasData ?? []);
      setDespesas(despesasData ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  function mudarMes(delta: number) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
    if (novoMes > 11) { novoMes = 0; novoAno += 1; }
    setMes(novoMes);
    setAno(novoAno);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando DRE...
      </div>
    );
  }

  const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}`;

  const receitaBruta = receitas
    .filter((r) => r.status === "Pago" && r.vencimento.startsWith(prefixo))
    .reduce((acc, r) => acc + r.valor, 0);

  const despesasDoMes = despesas.filter((d) => d.data.startsWith(prefixo));
  const despesasPorCategoria = despesasDoMes.reduce<Record<string, number>>((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor;
    return acc;
  }, {});
  const totalDespesas = despesasDoMes.reduce((acc, d) => acc + d.valor, 0);
  const resultadoLiquido = receitaBruta - totalDespesas;
  const margem = receitaBruta > 0 ? (resultadoLiquido / receitaBruta) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => mudarMes(-1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13.5px] font-semibold text-[#16181d] w-[140px] text-center">
          {nomesMeses[mes]} {ano}
        </span>
        <button
          onClick={() => mudarMes(1)}
          className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#eef0f2] bg-[#fafbfc]">
          <span className="text-[13.5px] font-semibold text-[#16181d]">Receita Bruta</span>
          <span className="text-[15px] font-bold text-[#0e9f6e]">{formatarMoeda(receitaBruta)}</span>
        </div>

        <div className="px-5 py-3.5 border-b border-[#eef0f2]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13.5px] font-semibold text-[#16181d]">(-) Despesas Operacionais</span>
            <span className="text-[15px] font-bold text-[#f04438]">{formatarMoeda(totalDespesas)}</span>
          </div>
          <div className="flex flex-col gap-1.5 pl-3">
            {Object.entries(despesasPorCategoria).map(([cat, valor]) => (
              <div key={cat} className="flex items-center justify-between text-[12.5px] text-[#767c88]">
                <span>{cat}</span>
                <span>{formatarMoeda(valor)}</span>
              </div>
            ))}
            {Object.keys(despesasPorCategoria).length === 0 && (
              <span className="text-[12.5px] text-[#9aa0ac]">Nenhuma despesa neste mês.</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-[#eaf1fb]">
          <div>
            <span className="text-[13.5px] font-bold text-[#16181d]">(=) Resultado Líquido</span>
            <div className="text-[11.5px] text-[#5b6270]">Margem: {margem.toFixed(1)}%</div>
          </div>
          <span className={`text-[20px] font-bold ${resultadoLiquido >= 0 ? "text-primary" : "text-[#f04438]"}`}>
            {formatarMoeda(resultadoLiquido)}
          </span>
        </div>
      </div>

      <p className="text-[11.5px] text-[#9aa0ac]">
        Receita reconhecida por parcelas efetivamente pagas no mês selecionado. Despesas somadas por categoria, conforme cadastradas em Fluxo de Caixa.
      </p>
    </div>
  );
}
