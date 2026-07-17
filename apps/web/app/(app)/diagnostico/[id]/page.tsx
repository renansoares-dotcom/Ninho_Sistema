"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import DiagnosticoRadarChart from "@/components/charts/DiagnosticoRadarChart";
import { supabase } from "@/lib/supabase";

type Diagnostico = {
  id: string;
  status: string;
  indice_maturidade_geral: number | null;
  resumo_executivo: string | null;
  pontos_fortes: string[] | null;
  oportunidades_melhoria: string[] | null;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
};

type Area = { area: string; nota: number };

export default function DiagnosticoDetalhePage() {
  const params = useParams<{ id: string }>();
  const [diag, setDiag] = useState<Diagnostico | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: diagData, error: diagErro }, { data: areasData }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("id, status, indice_maturidade_geral, resumo_executivo, pontos_fortes, oportunidades_melhoria, clientes(nome_fantasia, razao_social)")
          .eq("id", params.id)
          .single(),
        supabase.from("diagnostico_areas").select("area, nota").eq("diagnostico_id", params.id),
      ]);

      if (diagErro) setErro(diagErro.message);
      setDiag(diagData as any);
      setAreas(areasData ?? []);
      setCarregando(false);
    }
    if (params.id) carregar();
  }, [params.id]);

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

  return (
    <>
      <PageHeader crumb="Diagnóstico" title={`Diagnóstico — ${nomeCliente}`} secondaryLabel="Gerar PDF" />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-3.5">
        <div className="grid grid-cols-[1fr_1.1fr] gap-3.5">
          <Card title="Resumo executivo">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold text-primary">
                {diag.indice_maturidade_geral ? diag.indice_maturidade_geral.toFixed(1) : "—"}
              </div>
              <div className="text-[12.5px] text-[#9aa0ac]">Índice geral de maturidade (0–10)</div>
            </div>
            <p className="text-[13px] text-[#3f434d] leading-relaxed">
              {diag.resumo_executivo ?? "Resumo executivo disponível após a conclusão do diagnóstico."}
            </p>
          </Card>

          <Card title="Radar por área">
            <DiagnosticoRadarChart data={areas} />
          </Card>
        </div>

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
      </div>
    </>
  );
}
