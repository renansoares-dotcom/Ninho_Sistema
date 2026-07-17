import PageHeader from "@/components/shared/PageHeader";
import ConfiguracoesPanel from "@/components/shared/ConfiguracoesPanel";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Configurações" />
      <ConfiguracoesPanel />
    </>
  );
}
