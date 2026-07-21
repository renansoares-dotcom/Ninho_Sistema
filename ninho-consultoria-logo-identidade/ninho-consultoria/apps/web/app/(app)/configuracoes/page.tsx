import PageHeader from "@/components/shared/PageHeader";
import ConfiguracoesPanel from "@/components/shared/ConfiguracoesPanel";
import UsuariosPanel from "@/components/shared/UsuariosPanel";
import CampanhaAcompanhamentoPanel from "@/components/shared/CampanhaAcompanhamentoPanel";
import DiagnosticoPublicoPerguntasPanel from "@/components/shared/DiagnosticoPublicoPerguntasPanel";
import IdentidadeVisualPanel from "@/components/shared/IdentidadeVisualPanel";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Configurações" />
      <div className="max-w-[1360px] mx-auto px-7 pt-4 flex flex-col gap-4">
        <IdentidadeVisualPanel />
        <UsuariosPanel />
        <CampanhaAcompanhamentoPanel />
        <DiagnosticoPublicoPerguntasPanel />
      </div>
      <ConfiguracoesPanel />
    </>
  );
}
