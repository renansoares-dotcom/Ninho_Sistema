"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import CrmBoard from "@/components/shared/CrmBoard";
import OportunidadeFormModal from "@/components/shared/OportunidadeFormModal";

export default function CrmPage() {
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
        crumb="Comercial"
        title="CRM — Funil de Vendas"
        actionLabel="Nova oportunidade"
        onActionClick={() => setModalAberto(true)}
        secondaryLabel="Filtros"
      />
      <CrmBoard refreshKey={refreshKey} />

      <OportunidadeFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
