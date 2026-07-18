"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import FinanceiroPanel from "@/components/shared/FinanceiroPanel";
import ContratoFormModal from "@/components/shared/ContratoFormModal";

export default function FinanceiroPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        crumb="Início"
        title="Financeiro"
        actionLabel="Novo contrato"
        onActionClick={() => setModalAberto(true)}
      />
      <FinanceiroPanel refreshKey={refreshKey} />

      <ContratoFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
