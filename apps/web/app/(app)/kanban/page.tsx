"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import KanbanBoard from "@/components/shared/KanbanBoard";
import TarefaFormModal from "@/components/shared/TarefaFormModal";

export default function KanbanPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        crumb="Início"
        title="Kanban"
        actionLabel="Nova tarefa"
        onActionClick={() => setModalAberto(true)}
      />
      <KanbanBoard refreshKey={refreshKey} />

      <TarefaFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
