"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import CrmBoard from "@/components/shared/CrmBoard";
import OportunidadeFormModal from "@/components/shared/OportunidadeFormModal";

export default function CrmPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
