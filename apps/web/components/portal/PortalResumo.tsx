"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, LineChart, Folder, ArrowRight, Info, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePortal } from "./PortalContext";

function corPorFaixa(v: number) {
  if (v >= 80) return "#0e9f6e";
  if (v >= 50) return "#f59e0b";
  return "#f04438";
}
function labelPorFaixa(v: number) {
  if (v >= 80) return "No caminho certo";
  if (v >= 50) return "Em progresso";
  return "Precisa de atenção";
}

function Gauge({ valor, cor }: { valor: number; cor: string }) {
  return (
    <div
      className="rounded-full w-[92px] h-[92px] flex items-center justify-center shrink-0"
      style={{ background: `conic-gradient(${cor} ${valor * 3.6}deg, #f0f1f3 0deg)` }}
    >
      <div className="bg-white rounded-full w-[72px] h-[72px] flex items-center justify-center">
        <span className="text-[22px] font-bold" style={{ color: cor }}>{Math.round(valor)}</span>
      </div>
    </div>
  );
}

type Resumo = {
  progresso: number;
  diagnosticoStatus: string | null;
  planoTotal: number;
  planoConcluidas: number;
  kpisCount: number;
  arquivosCount: number;
  proximaReuniao: { titulo: string; data: string } | null;
};

export default function PortalResumo() {
  const { clienteId, clienteNome, userNome } = usePortal();
  const [dados, setDados] = useState<Resumo | null>(null);
  const [campanhaAberta, setCampanhaAberta] = useState<{ titulo: string } | null>(null);

  useEffect(() => {
    async function carregarCampanha() {
      const { data: campanha } = await supabase
        .from("diagnostico_campanhas")
        .select("id, titulo")
        .eq("ativa", true)
        .maybeSingle();
      if (!campanha) return;

      const [{ data: ultimoEnvio }, { data: ultimaLiberacao }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("created_at")
          .eq("campanha_id", campanha.id)
          .eq("cliente_id", clienteId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("diagnostico_campanha_liberacoes")
          .select("liberado_em")
          .eq("campanha_id", campanha.id)
          .eq("cliente_id", clienteId)
          .order("liberado_em", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const podeResponder =
        !ultimoEnvio || (ultimaLiberacao && new Date(ultimaLiberacao.liberado_em) > new Date(ultimoEnvio.created_at));

      if (podeResponder) setCampanhaAberta({ titulo: campanha.titulo });
    }
    carregarCampanha();
  }, [clienteId]);

  useEffect(() => {
    async function carregar() {
      const [{ data: diagnosticos }, { data: planos }, { data: kpis }, { data: arquivos }, { data: eventos }] =
        await Promise.all([
          supabase
            .from("diagnosticos")
            .select("id, status, indice_maturidade_geral")
            .eq("cliente_id", clienteId)
            .order("data", { ascending: false }),
          supabase.from("planos_trabalho").select("id, plano_acoes(status)").eq("cliente_id", clienteId),
          supabase.from("kpi_definicoes").select("id, kpi_valores(valor, tipo)").eq("cliente_id", clienteId),
          supabase.from("arquivos").select("id").eq("cliente_id", clienteId),
          supabase
            .from("eventos")
            .select("titulo, data_inicio")
            .eq("cliente_id", clienteId)
            .gte("data_inicio", new Date().toISOString())
            .order("data_inicio", { ascending: true })
            .limit(1),
        ]);

      const diagConcluido = (diagnosticos ?? []).find((d) => d.status === "Concluído") ?? diagnosticos?.[0] ?? null;
      const diagnosticoScore = diagConcluido?.indice_maturidade_geral ? diagConcluido.indice_maturidade_geral * 10 : 50;

      const acoesTodas = (planos ?? []).flatMap((p: any) => p.plano_acoes ?? []);
      const planoConcluidas = acoesTodas.filter((a: any) => a.status === "Concluído").length;
      const execucaoScore = acoesTodas.length > 0 ? (planoConcluidas / acoesTodas.length) * 100 : 50;

      const kpisComBaseline = (kpis ?? []).filter((k: any) => k.kpi_valores?.some((v: any) => v.tipo === "baseline"));
      const kpisPositivos = kpisComBaseline.filter((k: any) => {
        const baseline = k.kpi_valores.find((v: any) => v.tipo === "baseline")?.valor;
        const atuais = k.kpi_valores.filter((v: any) => v.tipo === "atual");
        const ultimo = atuais[atuais.length - 1]?.valor;
        return baseline !== undefined && ultimo !== undefined && ultimo >= baseline;
      }).length;
      const indicadoresScore = kpisComBaseline.length > 0 ? (kpisPositivos / kpisComBaseline.length) * 100 : 50;

      const progresso = (diagnosticoScore + execucaoScore + indicadoresScore) / 3;

      setDados({
        progresso,
        diagnosticoStatus: diagConcluido?.status ?? null,
        planoTotal: acoesTodas.length,
        planoConcluidas,
        kpisCount: kpis?.length ?? 0,
        arquivosCount: arquivos?.length ?? 0,
        proximaReuniao: eventos?.[0] ? { titulo: eventos[0].titulo, data: eventos[0].data_inicio } : null,
      });
    }
    carregar();
  }, [clienteId]);

  return (
    <div className="max-w-[1100px] mx-auto px-7 py-7 flex flex-col gap-5">
      <div>
        <div className="text-[12.5px] text-[#9aa0ac] mb-1">Bem-vindo(a), {userNome.split(" ")[0]}</div>
        <h1 className="text-[22px] font-semibold text-[#16181d] tracking-tight">{clienteNome}</h1>
      </div>

      {campanhaAberta && (
        <Link
          href="/portal/diagnostico"
          className="flex items-center justify-between gap-3 bg-[#eaf1fb] border border-[#cfe0f5] rounded-2xl px-5 py-4 hover:brightness-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
              <Megaphone size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-[#16181d]">Diagnóstico de acompanhamento disponível</div>
              <div className="text-[12px] text-[#3f434d]">{campanhaAberta.titulo} — leva menos de 5 minutos</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-primary shrink-0" />
        </Link>
      )}

      {!dados ? (
        <div className="bg-white border border-[#eef0f2] rounded-2xl h-[150px] animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#eef0f2] rounded-2xl p-5 flex items-center gap-4">
              <Gauge valor={dados.progresso} cor={corPorFaixa(dados.progresso)} />
              <div>
                <span className="text-[13.5px] font-semibold text-[#16181d]">Progresso do seu projeto</span>
                <div>
                  <span
                    className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1.5"
                    style={{ background: `${corPorFaixa(dados.progresso)}1a`, color: corPorFaixa(dados.progresso) }}
                  >
                    {labelPorFaixa(dados.progresso)}
                  </span>
                </div>
                <div className="text-[11px] text-[#9aa0ac] mt-1.5 flex items-center gap-1">
                  <Info size={10} />
                  Diagnóstico, plano de trabalho e indicadores
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#eef0f2] rounded-2xl p-5 flex flex-col justify-center gap-2.5">
              <div className="flex items-center gap-2 text-[13px] text-[#3f434d]">
                <CalendarDays size={15} className="text-primary" />
                {dados.proximaReuniao
                  ? (
                    <span>
                      Próxima reunião: <strong>{dados.proximaReuniao.titulo}</strong> em{" "}
                      {new Date(dados.proximaReuniao.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )
                  : "Nenhuma reunião agendada no momento"}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#3f434d]">
                <ClipboardList size={15} className="text-primary" />
                {dados.planoTotal > 0
                  ? `${dados.planoConcluidas} de ${dados.planoTotal} ações do plano de trabalho concluídas`
                  : "Plano de trabalho ainda não iniciado"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/portal/plano-trabalho"
              className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center justify-between hover:border-[#d8dce2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf1fb] flex items-center justify-center">
                  <ClipboardList size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#16181d]">Plano de Trabalho</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">{dados.planoTotal} ações</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#c2c6cd]" />
            </Link>

            <Link
              href="/portal/indicadores"
              className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center justify-between hover:border-[#d8dce2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf1fb] flex items-center justify-center">
                  <LineChart size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#16181d]">Indicadores</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">{dados.kpisCount} acompanhados</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#c2c6cd]" />
            </Link>

            <Link
              href="/portal/arquivos"
              className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center justify-between hover:border-[#d8dce2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf1fb] flex items-center justify-center">
                  <Folder size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#16181d]">Arquivos</div>
                  <div className="text-[11.5px] text-[#9aa0ac]">{dados.arquivosCount} disponíveis</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#c2c6cd]" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
