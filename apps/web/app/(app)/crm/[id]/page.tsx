"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, Tag, Clock, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Avatar } from "@/components/shared/Avatar";
import OportunidadeFormModal, { OportunidadeFormData } from "@/components/shared/OportunidadeFormModal";
import { colunasCRM } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

type Oportunidade = {
  id: string;
  empresa_nome: string;
  etapa: string;
  valor_estimado: number | null;
  probabilidade: number | null;
  responsavel_nome: string | null;
  telefone: string | null;
  email: string | null;
  origem: string | null;
  observacoes: string | null;
  updated_at: string;
};

type Atividade = {
  id: string;
  tipo: string;
  descricao: string | null;
  data: string;
};

export default function OportunidadeDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [op, setOp] = useState<Oportunidade | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [{ data: opData, error: opErro }, { data: atividadesData }] = await Promise.all([
      supabase.from("leads_oportunidades").select("*").eq("id", params.id).single(),
      supabase.from("oportunidade_atividades").select("*").eq("oportunidade_id", params.id).order("data", { ascending: true }),
    ]);

    if (opErro) setErro(opErro.message);
    setOp(opData);
    setAtividades(atividadesData ?? []);
    setCarregando(false);
  }, [params.id]);

  useEffect(() => {
    if (params.id) carregar();
  }, [params.id, carregar]);

  async function excluir() {
    if (!op) return;
    if (!confirm(`Tem certeza que deseja excluir "${op.empresa_nome}"? Essa ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    const { error } = await supabase.from("leads_oportunidades").delete().eq("id", op.id);
    setExcluindo(false);
    if (error) {
      alert(`Não foi possível excluir: ${error.message}`);
      return;
    }
    router.push("/crm");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando oportunidade...
      </div>
    );
  }

  if (erro || !op) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-24 text-center text-[#9aa0ac] text-[13.5px]">
        Oportunidade não encontrada{erro ? `: ${erro}` : "."}
      </div>
    );
  }

  const etapaId = op.etapa === "cliente_ativo" ? "ativo" : op.etapa;
  const etapa = colunasCRM.find((c) => c.id === etapaId);
  const dias = Math.max(0, Math.floor((Date.now() - new Date(op.updated_at).getTime()) / (1000 * 60 * 60 * 24)));

  const formInicial: OportunidadeFormData = {
    id: op.id,
    empresa_nome: op.empresa_nome,
    responsavel_nome: op.responsavel_nome ?? "",
    telefone: op.telefone ?? "",
    email: op.email ?? "",
    origem: op.origem ?? "",
    etapa: etapaId,
    valor_estimado: op.valor_estimado ? String(op.valor_estimado) : "",
    probabilidade: String(op.probabilidade ?? 0),
    observacoes: op.observacoes ?? "",
  };

  return (
    <>
      <PageHeader
        crumb="CRM"
        title={op.empresa_nome}
        secondaryLabel="Editar"
        onSecondaryClick={() => setModalAberto(true)}
        dangerLabel={excluindo ? "Excluindo..." : "Excluir"}
        onDangerClick={excluir}
      />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
        <div className="flex flex-col gap-3.5">
          <Card title="Identificação">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Empresa" value={op.empresa_nome} />
              <Field
                label="Responsável"
                value=""
                child={
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.responsavel_nome || "—"} size={24} />
                    <span className="text-[13.5px] text-[#3f434d]">{op.responsavel_nome ?? "—"}</span>
                  </div>
                }
              />
              <Field label="Telefone" value={op.telefone ?? "—"} />
              <Field label="E-mail" value={op.email ?? "—"} />
              <Field label="Origem do lead" value={op.origem ?? "—"} />
              <Field label="Dias na etapa" value={`${dias} dias`} />
            </div>
          </Card>

          <Card title="Valores">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Valor estimado" value={op.valor_estimado ? `R$ ${op.valor_estimado.toLocaleString("pt-BR")}` : "—"} />
              <Field label="Probabilidade de fechamento" value={`${op.probabilidade ?? 0}%`} />
              <Field label="Etapa atual" value={etapa?.nome ?? "—"} />
            </div>
          </Card>

          <Card title="Histórico de contatos">
            <div className="flex flex-col gap-3">
              {atividades.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
                    <Tag size={12} color="#004AAD" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#16181d]">{a.tipo}</div>
                    <div className="text-[12.5px] text-[#767c88]">{a.descricao}</div>
                  </div>
                  <span className="text-[12px] text-[#9aa0ac] flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {new Date(a.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
              {atividades.length === 0 && (
                <p className="text-[12.5px] text-[#9aa0ac]">Nenhum contato registrado ainda.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="Observações">
            <p className="text-[13px] text-[#3f434d] leading-relaxed">
              {op.observacoes ?? "Sem observações registradas."}
            </p>
          </Card>

          <Card title="Contato">
            <div className="flex flex-col gap-2.5 text-[13px] text-[#3f434d]">
              <span className="flex items-center gap-2"><Phone size={14} color="#9aa0ac" />{op.telefone ?? "—"}</span>
              <span className="flex items-center gap-2"><Mail size={14} color="#9aa0ac" />{op.email ?? "—"}</span>
            </div>
          </Card>
        </div>
      </div>

      <OportunidadeFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={carregar}
        oportunidadeInicial={formInicial}
      />
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
