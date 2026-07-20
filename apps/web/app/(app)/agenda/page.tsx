"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import AgendaView from "@/components/shared/AgendaView";
import EventoFormModal from "@/components/shared/EventoFormModal";

export default function AgendaPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("novo") === "1") {
      setModalAberto(true);
    }
  }, []);

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
