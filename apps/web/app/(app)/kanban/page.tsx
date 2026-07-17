import PageHeader from "@/components/shared/PageHeader";

export default function KanbanPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Kanban" actionLabel="Nova tarefa" />
      <div className="max-w-[1360px] mx-auto px-7 py-16 text-center text-[#9aa0ac] text-[13.5px]">
        Tela de &quot;Kanban&quot; entra em uma próxima leva da Fase 2.
      </div>
    </>
  );
}
