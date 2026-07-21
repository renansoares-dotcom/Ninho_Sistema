"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ClientesTable from "@/components/shared/ClientesTable";
import ClienteFormModal from "@/components/shared/ClienteFormModal";

export default function ClientesPage() {
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
