import PageHeader from "@/components/shared/PageHeader";
import CrmBoard from "@/components/shared/CrmBoard";

export default function CrmPage() {
  return (
    <>
      <PageHeader crumb="Comercial" title="CRM — Funil de Vendas" actionLabel="Nova oportunidade" secondaryLabel="Filtros" />
      <CrmBoard />
    </>
  );
}
