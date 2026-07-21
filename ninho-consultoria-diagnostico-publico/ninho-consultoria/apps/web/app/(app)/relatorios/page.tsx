import PageHeader from "@/components/shared/PageHeader";
import RelatoriosList from "@/components/shared/RelatoriosList";

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Relatórios" secondaryLabel="Filtrar tipo" />
      <RelatoriosList />
    </>
  );
}
