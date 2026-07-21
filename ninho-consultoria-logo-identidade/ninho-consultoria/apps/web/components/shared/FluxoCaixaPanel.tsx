"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabase";
import DespesaFormModal, { DespesaFormData } from "./DespesaFormModal";

type Despesa = {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: string;
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function mesLabel(iso: string) {
  const [ano, mes] = iso.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[Number(mes) - 1]}/${ano.slice(2)}`;
}

export default function FluxoCaixaPanel() {
  const [parcelas, setParcelas] = useState<{ valor: number; vencimento: string; status: string }[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState<DespesaFormData | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: parcelasData }, { data: despesasData }] = await Promise.all([
        supabase.from("contrato_parcelas").select("valor, vencimento, status"),
        supabase.from("despesas").select("id, descricao, categoria, valor, data, tipo").order("data", { ascending: false }),
      ]);
      setParcelas(parcelasData ?? []);
      setDespesas(despesasData ?? []);
      setCarregando(false);
    }
    carregar();
  }, [internalRefresh]);

  function abrirNova() {
    setDespesaSelecionada(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(d: Despesa) {
    setDespesaSelecionada({
      id: d.id,
      descricao: d.descricao,
      categoria: d.categoria,
      valor: String(d.valor),
      data: d.data,
      tipo: d.tipo,
    });
    setModalAberto(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando fluxo de caixa...
      </div>
    );
  }

  // Agrupa entradas (parcelas) e saídas (despesas) por mês (AAAA-MM)
  const meses: Record<string, { entradas: number; saidas: number }> = {};

  parcelas.forEach((p) => {
    const chave = p.vencimento.slice(0, 7);
    meses[chave] = meses[chave] ?? { entradas: 0, saidas: 0 };
    meses[chave].entradas += p.valor;
  });

  despesas.forEach((d) => {
    const chave = d.data.slice(0, 7);
    meses[chave] = meses[chave] ?? { entradas: 0, saidas: 0 };
    meses[chave].saidas += d.valor;
  });

  const chavesOrdenadas = Object.keys(meses).sort();
  let saldoAcumulado = 0;
  const dadosGrafico = chavesOrdenadas.map((chave) => {
    const { entradas, saidas } = meses[chave];
    saldoAcumulado += entradas - saidas;
    return { mes: mesLabel(chave), entradas, saidas, saldo: saldoAcumulado };
  });

  const totalEntradas = parcelas.reduce((acc, p) => acc + p.valor, 0);
  const totalSaidas = despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
          <div className="text-[12px] text-[#9aa0ac] mb-1">Total de entradas</div>
          <div className="text-[20px] font-bold text-[#0e9f6e]">{formatarMoeda(totalEntradas)}</div>
        </div>
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
          <div className="text-[12px] text-[#9aa0ac] mb-1">Total de saídas</div>
          <div className="text-[20px] font-bold text-[#f04438]">{formatarMoeda(totalSaidas)}</div>
        </div>
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
          <div className="text-[12px] text-[#9aa0ac] mb-1">Saldo do período</div>
          <div className={`text-[20px] font-bold ${totalEntradas - totalSaidas >= 0 ? "text-primary" : "text-[#f04438]"}`}>
            {formatarMoeda(totalEntradas - totalSaidas)}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl p-5">
        <div className="text-[13.5px] font-semibold text-[#16181d] mb-3">Entradas x Saídas por mês</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dadosGrafico}>
            <CartesianGrid vertical={false} stroke="#f0f1f3" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9aa0ac" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9aa0ac" }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="entradas" fill="#0e9f6e" name="Entradas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saidas" fill="#f04438" name="Saídas" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="saldo" stroke="#004AAD" strokeWidth={2.5} name="Saldo acumulado" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#eef0f2]">
          <span className="text-[13.5px] font-semibold text-[#16181d]">Despesas</span>
          <button
            onClick={abrirNova}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-primary text-white"
          >
            <Plus size={13} />
            Nova despesa
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-2.5 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Descrição</th>
              <th className="px-5 py-2.5 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Categoria</th>
              <th className="px-5 py-2.5 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Data</th>
              <th className="px-5 py-2.5 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Valor</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((d) => (
              <tr key={d.id} onClick={() => abrirEdicao(d)} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer">
                <td className="px-5 py-3 text-[13px] font-medium text-[#16181d]">{d.descricao}</td>
                <td className="px-5 py-3 text-[12.5px] text-[#5b6270]">{d.categoria}</td>
                <td className="px-5 py-3 text-[12px] text-[#9aa0ac]">{new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-[#f04438]">{formatarMoeda(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DespesaFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        onDeleted={() => setInternalRefresh((k) => k + 1)}
        despesaInicial={despesaSelecionada}
      />
    </div>
  );
}
