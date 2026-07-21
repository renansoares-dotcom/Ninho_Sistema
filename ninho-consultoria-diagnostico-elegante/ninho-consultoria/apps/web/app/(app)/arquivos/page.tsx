import PageHeader from "@/components/shared/PageHeader";
import ArquivosPanel from "@/components/shared/ArquivosPanel";

export default function ArquivosPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Arquivos" />
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
        <ArquivosPanel />
      </div>
    </>
  );
}
