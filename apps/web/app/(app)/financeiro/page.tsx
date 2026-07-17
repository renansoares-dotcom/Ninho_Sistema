import PageHeader from "@/components/shared/PageHeader";
import FinanceiroPanel from "@/components/shared/FinanceiroPanel";

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Financeiro" secondaryLabel="Filtrar período" />
      <FinanceiroPanel />
    </>
  );
}
