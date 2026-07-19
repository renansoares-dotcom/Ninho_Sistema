"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, AlertOctagon, Loader2, Pencil, ClipboardList } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import DiagnosticoRadarChart from "@/components/charts/DiagnosticoRadarChart";
import DiagnosticoHeatmap from "@/components/charts/DiagnosticoHeatmap";
import DiagnosticoPrioridades from "@/components/shared/DiagnosticoPrioridades";
import DiagnosticoRecomendacoes from "@/components/shared/DiagnosticoRecomendacoes";
import { supabase } from "@/lib/supabase";

type Diagnostico = {
  id: string;
  cliente_id: string;
  status: string;
  indice_maturidade_geral: number | null;
  resumo_executivo: string | null;
  pontos_fortes: string[] | null;
  oportunidades_melhoria: string[] | null;
  riscos: string[] | null;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
};

type Area = { area: string; nota: number };

export default function DiagnosticoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [diag, setDiag] = useState<Diagnostico | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [planoExistenteId, setPlanoExistenteId] = useState<string | null>(null);
  const [gerandoPlano, setGerandoPlano] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: diagData, error: diagErro }, { data: areasData }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("id, cliente_id, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria, riscos, clientes(nome_fantasia, razao_social)")
          .eq("id", params.id)
          .single(),
        supabase.from("diagnostico_areas").select("area, nota").eq("diagnostico_id", params.id),
      ]);

      if (diagErro) setErro(diagErro.message);
      setDiag(diagData as any);
      setAreas(areasData ?? []);

      const { data: planoData } = await supabase
        .from("planos_trabalho")
        .select("id")
        .eq("diagnostico_id", params.id)
        .maybeSingle();
      setPlanoExistenteId(planoData?.id ?? null);

      setCarregando(false);
    }
    if (params.id) carregar();
  }, [params.id]);

  async function gerarPlanoDeTrabalho() {
    if (!diag) return;
    setGerandoPlano(true);

    const { data: novoPlano, error } = await supabase
      .from("planos_trabalho")
      .insert({ cliente_id: diag.cliente_id, diagnostico_id: diag.id, status: "Ativo" })
      .select("id")
      .single();

    if (error || !novoPlano) {
      setGerandoPlano(false);
      alert(`Não foi possível gerar o plano de trabalho: ${error?.message}`);
      return;
    }

    const acoes = (diag.oportunidades_melhoria ?? []).map((op) => ({
      plano_id: novoPlano.id,
      titulo: op,
      prioridade: "Média",
      status: "Pendente",
    }));

    if (acoes.length > 0) {
      await supabase.from("plano_acoes").insert(acoes);
    }

    setGerandoPlano(false);
    router.push(`/plano-trabalho/${novoPlano.id}`);
  }

  async function excluir() {
    if (!confirm("Tem certeza que deseja excluir este diagnóstico? Essa ação não pode ser desfeita.")) return;
    setExcluindo(true);
    const { error } = await supabase.from("diagnosticos").delete().eq("id", params.id);
    setExcluindo(false);
    if (error) {
      alert(`Não foi possível excluir: ${error.message}`);
      return;
    }
    router.push("/diagnostico");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando diagnóstico...
      </div>
    );
  }

  if (erro || !diag) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-24 text-center text-[#9aa0ac] text-[13.5px]">
        Diagnóstico não encontrado{erro ? `: ${erro}` : "."}
      </div>
    );
  }

  const nomeCliente = diag.clientes?.nome_fantasia ?? diag.clientes?.razao_social ?? "Cliente";
  const temAreas = areas.length > 0;

  return (
    <>
      <PageHeader
        crumb="Diagnóstico"
        title={`Diagnóstico — ${nomeCliente}`}
        actionLabel="Editar"
        actionHref={`/diagnostico/novo?editar=${diag.id}`}
        actionIcon={Pencil}
        secondaryLabel="Gerar PDF"
        dangerLabel={excluindo ? "Excluindo..." : "Excluir"}
        onDangerClick={excluir}
      />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-3.5">
        <div className="grid grid-cols-[1fr_1.1fr] gap-3.5">
          <Card title="Resumo executivo">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold text-primary">
                {diag.indice_maturidade_geral ? diag.indice_maturidade_geral.toFixed(1) : "—"}
              </div>
              <div className="text-[12.5px] text-[#9aa0ac]">Índice geral de maturidade (0–10)</div>
            </div>
            <p className="text-[13px] text-[#3f434d] leading-relaxed mb-4">
              {diag.resumo_executivo ?? "Resumo executivo disponível após a conclusão do diagnóstico."}
            </p>
            {planoExistenteId ? (
              <button
                onClick={() => router.push(`/plano-trabalho/${planoExistenteId}`)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e4e6ea] text-[#3f434d] hover:bg-[#f5f6f8]"
              >
                <ClipboardList size={14} />
                Ver plano de trabalho
              </button>
            ) : (
              <button
                onClick={gerarPlanoDeTrabalho}
                disabled={gerandoPlano}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
              >
                {gerandoPlano ? <Loader2 size={14} className="animate-spin" /> : <ClipboardList size={14} />}
                Gerar plano de trabalho
              </button>
            )}
          </Card>

          <Card title="Radar por área">
            <DiagnosticoRadarChart data={areas} />
          </Card>
        </div>

        {temAreas && (
          <div className="grid grid-cols-2 gap-3.5">
            <Card title="Heatmap por área">
              <DiagnosticoHeatmap areas={areas} />
            </Card>
            <Card title="Matriz de prioridades">
              <DiagnosticoPrioridades areas={areas} />
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Card title="Pontos fortes">
            <div className="flex flex-col gap-2.5">
              {(diag.pontos_fortes ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#0e9f6e] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#3f434d]">{p}</span>
                </div>
              ))}
              {!diag.pontos_fortes?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Ainda não identificado.</p>
              )}
            </div>
          </Card>
          <Card title="Oportunidades de melhoria">
            <div className="flex flex-col gap-2.5">
              {(diag.oportunidades_melhoria ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-[#f59e0b] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#3f434d]">{p}</span>
                </div>
              ))}
              {!diag.oportunidades_melhoria?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Ainda não identificado.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Card title="Riscos identificados">
            <div className="flex flex-col gap-2.5">
              {(diag.riscos ?? []).map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertOctagon size={16} className="text-[#f04438] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#3f434d]">{r}</span>
                </div>
              ))}
              {!diag.riscos?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Nenhum risco registrado.</p>
              )}
            </div>
          </Card>

          {temAreas && (
            <Card title="Recomendações automáticas">
              <DiagnosticoRecomendacoes areas={areas} />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
