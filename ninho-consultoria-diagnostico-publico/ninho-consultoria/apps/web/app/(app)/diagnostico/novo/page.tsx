import { Suspense } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DiagnosticoForm from "@/components/shared/DiagnosticoForm";

export default function NovoDiagnosticoPage() {
  return (
    <>
      <PageHeader crumb="Diagnóstico" title="Novo Diagnóstico Empresarial" />
      <Suspense fallback={null}>
        <DiagnosticoForm />
      </Suspense>
    </>
  );
}
