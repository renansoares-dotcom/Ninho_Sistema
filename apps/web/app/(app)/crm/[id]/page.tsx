import { notFound } from "next/navigation";
import { Phone, Mail, Tag, Clock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Avatar } from "@/components/shared/Avatar";
import { oportunidades, oportunidadesDetalhe, colunasCRM } from "@/lib/mock-data";

export default function OportunidadeDetalhePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const op = oportunidades.find((o) => o.id === id);
  const detalhe = oportunidadesDetalhe[id];
  const etapa = colunasCRM.find((c) => c.id === op?.etapa);

  if (!op) return notFound();

  return (
    <>
      <PageHeader crumb="CRM" title={op.empresa} secondaryLabel="Editar" actionLabel="Mover etapa" />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
        <div className="flex flex-col gap-3.5">
          <Card title="Identificação">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Empresa" value={op.empresa} />
              <Field label="Responsável" value="" child={<div className="flex items-center gap-2"><Avatar initials={op.resp} size={24} /><span className="text-[13.5px] text-[#3f434d]">{op.resp}</span></div>} />
              <Field label="Telefone" value={detalhe?.telefone ?? "—"} />
              <Field label="E-mail" value={detalhe?.email ?? "—"} />
              <Field label="Origem do lead" value={detalhe?.origem ?? "—"} />
              <Field label="Dias na etapa" value={`${op.dias} dias`} />
            </div>
          </Card>

          <Card title="Valores">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Valor estimado" value={op.valor} />
              <Field label="Probabilidade de fechamento" value={`${op.prob}%`} />
              <Field label="Etapa atual" value={etapa?.nome ?? "—"} />
            </div>
          </Card>

          <Card title="Histórico de contatos">
            <div className="flex flex-col gap-3">
              {(detalhe?.atividades ?? []).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
                    <Tag size={12} color="#004AAD" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#16181d]">{a.tipo}</div>
                    <div className="text-[12.5px] text-[#767c88]">{a.descricao}</div>
                  </div>
                  <span className="text-[12px] text-[#9aa0ac] flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {a.data}
                  </span>
                </div>
              ))}
              {!detalhe?.atividades?.length && (
                <p className="text-[12.5px] text-[#9aa0ac]">Nenhum contato registrado ainda.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="Observações">
            <p className="text-[13px] text-[#3f434d] leading-relaxed">
              {detalhe?.observacoes ?? "Sem observações registradas."}
            </p>
          </Card>

          <Card title="Contato">
            <div className="flex flex-col gap-2.5 text-[13px] text-[#3f434d]">
              <span className="flex items-center gap-2"><Phone size={14} color="#9aa0ac" />{detalhe?.telefone ?? "—"}</span>
              <span className="flex items-center gap-2"><Mail size={14} color="#9aa0ac" />{detalhe?.email ?? "—"}</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, child }: { label: string; value: string; child?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] text-[#9aa0ac] mb-1">{label}</div>
      {child ?? <div className="text-[13.5px] text-[#16181d] font-medium">{value}</div>}
    </div>
  );
}
