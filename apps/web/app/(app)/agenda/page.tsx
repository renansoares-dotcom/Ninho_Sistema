import PageHeader from "@/components/shared/PageHeader";
import AgendaView from "@/components/shared/AgendaView";

export default function AgendaPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Agenda" actionLabel="Novo evento" />
      <AgendaView />
    </>
  );
}
