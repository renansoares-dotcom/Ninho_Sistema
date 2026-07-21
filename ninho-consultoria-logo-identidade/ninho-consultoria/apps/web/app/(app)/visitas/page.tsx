import PageHeader from "@/components/shared/PageHeader";
import VisitasPanel from "@/components/shared/VisitasPanel";

export default function VisitasPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Visitas" />
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
        <VisitasPanel />
      </div>
    </>
  );
}
