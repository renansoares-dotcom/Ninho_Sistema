"use client";

import { useEffect, useState } from "react";
import { TrendingUp, HeartPulse, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

function corPorFaixa(v: number) {
  if (v >= 80) return "#0e9f6e";
  if (v >= 50) return "#f59e0b";
  return "#f04438";
}

function labelPorFaixa(v: number) {
  if (v >= 80) return "Saudável";
  if (v >= 50) return "Atenção";
  return "Crítico";
}

function Gauge({ valor, cor }: { valor: number; cor: string }) {
  return (
    <div
      className="rounded-full w-[84px] h-[84px] flex items-center justify-center shrink-0"
      style={{ background: `conic-gradient(${cor} ${valor * 3.6}deg, #f0f1f3 0deg)` }}
    >
      <div className="bg-white rounded-full w-[66px] h-[66px] flex items-center justify-center">
        <span className="text-[20px] font-bold" style={{ color: cor }}>{Math.round(valor)}</span>
      </div>
    </div>
  );
}

export default function ClienteScores({ clienteId }: { clienteId: string }) {
  const [carregando, setCarregando] = useState(true);
  const [scoreEmpresarial, setScoreEmpresarial] = useState(50);
  const [healthScore, setHealthScore] = useState(50);
  const [subScores, setSubScores] = useState<{ label: string; valor: number }[]>([]);

  useEffect(() => {
    async function calcular() {
      setCarregando(true);

      const [
        { data: diagnosticos },
        { data: planos },
        { data: visitas },
        { data: tarefas },
        { data: arquivos },
        { data: kpis },
        { data: eventos },
        { data: contratos },
      ] = await Promise.all([
        supabase.from("diagnosticos").select("id, indice_maturidade_geral, riscos, status").eq("cliente_id", clienteId),
        supabase.from("planos_trabalho").select("id, plano_acoes(status)").eq("cliente_id", clienteId),
        supabase.from("visitas").select("data").eq("cliente_id", clienteId),
        supabase.from("tarefas").select("data_conclusao, coluna").eq("cliente_id", clienteId),
        supabase.from("arquivos").select("id").eq("cliente_id", clienteId),
        supabase.from("kpi_definicoes").select("id, kpi_valores(valor, tipo)").eq("cliente_id", clienteId),
        supabase.from("eventos").select("data_inicio").eq("cliente_id", clienteId),
        supabase.from("contratos").select("id, contrato_parcelas(status)").eq("cliente_id", clienteId),
      ]);

      const diagConcluido = (diagnosticos ?? []).find((d) => d.status === "Concluído");
      const areasResp = diagConcluido
        ? await supabase.from("diagnostico_areas").select("nota").eq("diagnostico_id", diagConcluido.id)
        : { data: [] as { nota: number }[] };

      const acoesTodas = (planos ?? []).flatMap((p: any) => p.plano_acoes ?? []);
      const execucao = acoesTodas.length > 0
        ? (acoesTodas.filter((a: any) => a.status === "Concluído").length / acoesTodas.length) * 100
        : 50;

      const diagnosticoScore = diagConcluido?.indice_maturidade_geral
        ? diagConcluido.indice_maturidade_geral * 10
        : 50;

      const hoje = new Date();
      const visitasRecentes = (visitas ?? []).filter((v) => {
        const dias = (hoje.getTime() - new Date(v.data + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24);
        return dias <= 90;
      }).length;
      const visitasScore = Math.min(visitasRecentes * 25, 100);

      const tarefasAtrasadas = (tarefas ?? []).filter(
        (t) => t.data_conclusao && t.data_conclusao < hoje.toISOString().slice(0, 10) && t.coluna !== "concluido"
      ).length;
      const pendenciasScore = Math.max(100 - tarefasAtrasadas * 20, 0);

      const documentacaoScore = Math.min((arquivos ?? []).length * 10, 100);

      const kpisComEvolucao = (kpis ?? []).filter((k: any) => k.kpi_valores?.some((v: any) => v.tipo === "baseline"));
      const kpisPositivos = kpisComEvolucao.filter((k: any) => {
        const baseline = k.kpi_valores.find((v: any) => v.tipo === "baseline")?.valor;
        const atuais = k.kpi_valores.filter((v: any) => v.tipo === "atual");
        const ultimo = atuais[atuais.length - 1]?.valor;
        return baseline !== undefined && ultimo !== undefined && ultimo >= baseline;
      }).length;
      const indicadoresScore = kpisComEvolucao.length > 0 ? (kpisPositivos / kpisComEvolucao.length) * 100 : 50;

      const scoreFinal =
        (execucao + diagnosticoScore + visitasScore + pendenciasScore + documentacaoScore + indicadoresScore) / 6;

      const ultimosContatos = [
        ...(eventos ?? []).map((e) => e.data_inicio.slice(0, 10)),
        ...(visitas ?? []).map((v) => v.data),
      ].sort().reverse();
      const diasUltimoContato = ultimosContatos[0]
        ? (hoje.getTime() - new Date(ultimosContatos[0] + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      const relacionamentoScore =
        diasUltimoContato <= 7 ? 100 : diasUltimoContato <= 30 ? 70 : diasUltimoContato <= 60 ? 40 : 15;

      const parcelasAtrasadas = (contratos ?? []).flatMap((c: any) => c.contrato_parcelas ?? []).filter(
        (p: any) => p.status === "Atrasado"
      ).length;
      const financeiroScore = Math.max(100 - parcelasAtrasadas * 30, 0);

      const areasCriticas = (areasResp.data ?? []).filter((a: any) => a.nota < 5.5).length;
      const operacaoScore = diagConcluido ? Math.max(100 - areasCriticas * 15, 0) : 50;

      const consultoriaScore = execucao;

      const riscosCount = (diagConcluido?.riscos as string[] | undefined)?.length ?? 0;
      const riscoScore = diagConcluido ? Math.max(100 - riscosCount * 20, 0) : 70;

      const healthFinal = (relacionamentoScore + financeiroScore + operacaoScore + consultoriaScore + riscoScore) / 5;

      setScoreEmpresarial(scoreFinal);
      setHealthScore(healthFinal);
      setSubScores([
        { label: "Relacionamento", valor: relacionamentoScore },
        { label: "Financeiro", valor: financeiroScore },
        { label: "Operação", valor: operacaoScore },
        { label: "Consultoria", valor: consultoriaScore },
        { label: "Risco", valor: riscoScore },
      ]);
      setCarregando(false);
    }
    calcular();
  }, [clienteId]);

  if (carregando) {
    return <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 h-[140px] animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3.5">
      <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4">
        <Gauge valor={scoreEmpresarial} cor={corPorFaixa(scoreEmpresarial)} />
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} color="#5b6270" />
            <span className="text-[13px] font-semibold text-[#16181d]">Score Empresarial</span>
          </div>
          <span
            className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1"
            style={{ background: `${corPorFaixa(scoreEmpresarial)}1a`, color: corPorFaixa(scoreEmpresarial) }}
          >
            {labelPorFaixa(scoreEmpresarial)}
          </span>
          <div className="text-[11px] text-[#9aa0ac] mt-1.5 flex items-center gap-1">
            <Info size={10} />
            Indicadores, diagnóstico, execução, visitas, pendências e documentação
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl p-4">
        <div className="flex items-center gap-4 mb-3">
          <Gauge valor={healthScore} cor={corPorFaixa(healthScore)} />
          <div>
            <div className="flex items-center gap-1.5">
              <HeartPulse size={14} color="#5b6270" />
              <span className="text-[13px] font-semibold text-[#16181d]">Health Score</span>
            </div>
            <span
              className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1"
              style={{ background: `${corPorFaixa(healthScore)}1a`, color: corPorFaixa(healthScore) }}
            >
              {labelPorFaixa(healthScore)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {subScores.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[11px] text-[#767c88] w-[92px] shrink-0">{s.label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-[#f0f1f3] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.valor}%`, background: corPorFaixa(s.valor) }}
                />
              </div>
              <span className="text-[10.5px] text-[#9aa0ac] w-7 text-right">{Math.round(s.valor)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
