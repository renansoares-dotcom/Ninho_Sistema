"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import AgendaView from "@/components/shared/AgendaView";
import EventoFormModal from "@/components/shared/EventoFormModal";

export default function AgendaPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        crumb="Início"
        title="Agenda"
        actionLabel="Novo evento"
        onActionClick={() => setModalAberto(true)}
      />
      <AgendaView refreshKey={refreshKey} />

      <EventoFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
