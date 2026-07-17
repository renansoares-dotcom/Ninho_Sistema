import { notFound } from "next/navigation";
import { Phone, Mail, Star, Clock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Avatar } from "@/components/shared/Avatar";
import { clientes, clientesDetalhe } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  Ativo: "bg-[#eafaf1] text-[#0e9f6e]",
  Prospect: "bg-[#eaf1fb] text-primary",
  Inativo: "bg-[#f5f6f8] text-[#767c88]",
};

export default function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const cliente = clientes.find((c) => c.id === id);
  const detalhe = clientesDetalhe[id];

  if (!cliente) return notFound();

  return (
    <>
      <PageHeader crumb="Clientes" title={cliente.nome} secondaryLabel="Editar" actionLabel="Registrar visita" />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
        <div className="flex flex-col gap-3.5">
          <Card title="Identificação">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Razão social" value={detalhe?.razaoSocial ?? "—"} />
              <Field label="CNPJ" value={detalhe?.cnpj ?? "—"} />
              <Field label="Segmento" value={cliente.segmento} />
              <Field label="Porte" value={detalhe?.porte ?? "—"} />
              <Field label="Funcionários" value={detalhe?.funcionarios ? String(detalhe.funcionarios) : "—"} />
              <Field label="Faturamento" value={cliente.faturamento} />
              <div className="col-span-2">
                <Field label="Endereço" value={detalhe?.endereco ?? "—"} />
              </div>
            </div>
          </Card>

          <Card title="Contatos principais">
            <div className="flex flex-col divide-y divide-[#f2f3f5]">
              {(detalhe?.contatos ?? []).map((c) => (
                <div key={c.nome} className="py-3 flex items-center gap-3">
                  <Avatar initials={c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")} size={32} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-semibold text-[#16181d]">{c.nome}</span>
                      {c.principal && <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />}
                    </div>
                    <div className="text-[12px] text-[#9aa0ac]">{c.cargo}</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-[12px] text-[#5b6270]">
                    <span className="flex items-center gap-1.5"><Phone size={12} />{c.telefone}</span>
                    <span className="flex items-center gap-1.5"><Mail size={12} />{c.email}</span>
                  </div>
                </div>
              ))}
              {!detalhe?.contatos?.length && (
                <p className="text-[12.5px] text-[#9aa0ac] py-2">Nenhum contato cadastrado.</p>
              )}
            </div>
          </Card>

          <Card title="Histórico">
            <div className="flex flex-col gap-3">
              {(detalhe?.atividades ?? []).map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-[7px] h-[7px] rounded-full bg-primary shrink-0" />
                  <span className="text-[13px] text-[#3f434d] flex-1">{a.titulo}</span>
                  <span className="text-[12px] text-[#9aa0ac] flex items-center gap-1">
                    <Clock size={11} />
                    {a.data}
                  </span>
                </div>
              ))}
              {!detalhe?.atividades?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Sem histórico registrado ainda.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="Status">
            <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[cliente.status]}`}>
              {cliente.status}
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <Field label="Responsável" value="" />
              <div className="flex items-center gap-2 -mt-2">
                <Avatar initials={cliente.resp} size={26} />
                <span className="text-[13px] text-[#3f434d]">{cliente.resp}</span>
              </div>
              <Field label="Última atividade" value={cliente.ultimaAtividade} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-[#9aa0ac] mb-1">{label}</div>
      {value && <div className="text-[13.5px] text-[#16181d] font-medium">{value}</div>}
    </div>
  );
}
