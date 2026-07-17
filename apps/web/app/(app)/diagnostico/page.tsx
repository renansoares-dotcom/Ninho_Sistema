import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import DiagnosticosList from "@/components/shared/DiagnosticosList";
import DiagnosticoRadarChart from "@/components/charts/DiagnosticoRadarChart";

export default function DiagnosticoPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Diagnóstico Empresarial" actionLabel="Novo diagnóstico" actionHref="/diagnostico/novo" />
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_1.1fr] gap-3.5">
          <Card title="Diagnósticos recentes">
            <DiagnosticosList />
          </Card>
          <Card title="Radar por área — Grupo Alvorada">
            <DiagnosticoRadarChart />
          </Card>
        </div>
      </div>
    </>
  );
}
