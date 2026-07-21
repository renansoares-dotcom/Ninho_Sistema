import PageHeader from "@/components/shared/PageHeader";
import AutomacoesList from "@/components/shared/AutomacoesList";

export default function AutomacoesPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Automações" actionLabel="Nova automação" />
      <AutomacoesList />
    </>
  );
}
