import PageHeader from "@/components/shared/PageHeader";
import ClientesTable from "@/components/shared/ClientesTable";

export default function ClientesPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Clientes" actionLabel="Novo cliente" />
      <ClientesTable />
    </>
  );
}
