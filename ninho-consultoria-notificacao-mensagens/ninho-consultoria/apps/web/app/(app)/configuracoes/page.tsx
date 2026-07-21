import PageHeader from "@/components/shared/PageHeader";
import ConfiguracoesPanel from "@/components/shared/ConfiguracoesPanel";
import UsuariosPanel from "@/components/shared/UsuariosPanel";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Configurações" />
      <div className="max-w-[1360px] mx-auto px-7 pt-4">
        <UsuariosPanel />
      </div>
      <ConfiguracoesPanel />
    </>
  );
}
