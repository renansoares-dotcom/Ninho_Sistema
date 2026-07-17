import { notFound } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import DiagnosticoRadarChart from "@/components/charts/DiagnosticoRadarChart";
import { diagnosticos, diagnosticosDetalhe } from "@/lib/mock-data";

export default function DiagnosticoDetalhePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const diag = diagnosticos.find((d) => d.id === id);
  const detalhe = diagnosticosDetalhe[id];

  if (!diag) return notFound();

  return (
    <>
      <PageHeader crumb="Diagnóstico" title={`Diagnóstico — ${diag.cliente}`} secondaryLabel="Gerar PDF" />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-3.5">
        <div className="grid grid-cols-[1fr_1.1fr] gap-3.5">
          <Card title="Resumo executivo">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold text-primary">
                {diag.indice > 0 ? diag.indice.toFixed(1) : "—"}
              </div>
              <div className="text-[12.5px] text-[#9aa0ac]">Índice geral de maturidade (0–10)</div>
            </div>
            <p className="text-[13px] text-[#3f434d] leading-relaxed">
              {detalhe?.resumoExecutivo ?? "Resumo executivo disponível após a conclusão do diagnóstico."}
            </p>
          </Card>

          <Card title="Radar por área">
            <DiagnosticoRadarChart />
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Card title="Pontos fortes">
            <div className="flex flex-col gap-2.5">
              {(detalhe?.pontosFortes ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#0e9f6e] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#3f434d]">{p}</span>
                </div>
              ))}
              {!detalhe?.pontosFortes?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Ainda não identificado.</p>
              )}
            </div>
          </Card>
          <Card title="Oportunidades de melhoria">
            <div className="flex flex-col gap-2.5">
              {(detalhe?.oportunidadesMelhoria ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-[#f59e0b] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#3f434d]">{p}</span>
                </div>
              ))}
              {!detalhe?.oportunidadesMelhoria?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Ainda não identificado.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
