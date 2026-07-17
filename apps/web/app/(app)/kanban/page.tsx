import PageHeader from "@/components/shared/PageHeader";
import KanbanBoard from "@/components/shared/KanbanBoard";

export default function KanbanPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Kanban" actionLabel="Nova tarefa" />
      <KanbanBoard />
    </>
  );
}
