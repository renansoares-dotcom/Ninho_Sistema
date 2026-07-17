"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ClientesTable from "@/components/shared/ClientesTable";
import ClienteFormModal from "@/components/shared/ClienteFormModal";

export default function ClientesPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        crumb="Início"
        title="Clientes"
        actionLabel="Novo cliente"
        onActionClick={() => setModalAberto(true)}
      />
      <ClientesTable refreshKey={refreshKey} />

      <ClienteFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
