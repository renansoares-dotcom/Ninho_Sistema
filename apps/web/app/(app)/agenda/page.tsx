import PageHeader from "@/components/shared/PageHeader";
import AgendaList from "@/components/shared/AgendaList";

export default function AgendaPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Agenda" actionLabel="Novo evento" />
      <AgendaList />
    </>
  );
}
