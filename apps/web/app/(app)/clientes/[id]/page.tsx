"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, Star, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Avatar } from "@/components/shared/Avatar";
import ClienteFormModal, { ClienteFormData } from "@/components/shared/ClienteFormModal";
import WorkspaceTabs, { AbaWorkspace } from "@/components/workspace/WorkspaceTabs";
import ClienteTimelineTab from "@/components/workspace/ClienteTimelineTab";
import ClienteKanbanTab from "@/components/workspace/ClienteKanbanTab";
import ClienteAgendaTab from "@/components/workspace/ClienteAgendaTab";
import ClienteDiagnosticoTab from "@/components/workspace/ClienteDiagnosticoTab";
import ClienteFinanceiroTab from "@/components/workspace/ClienteFinanceiroTab";
import ArquivosPanel from "@/components/shared/ArquivosPanel";
import VisitasPanel from "@/components/shared/VisitasPanel";
import ClientePlanoTrabalhoTab from "@/components/workspace/ClientePlanoTrabalhoTab";
import ClienteKpisTab from "@/components/workspace/ClienteKpisTab";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  Ativo: "bg-[#eafaf1] text-[#0e9f6e]",
  Prospect: "bg-[#eaf1fb] text-primary",
  Inativo: "bg-[#f5f6f8] text-[#767c88]",
};

type Cliente = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  segmento: string | null;
  porte: string | null;
  num_funcionarios: number | null;
  faturamento: number | null;
  endereco: { logradouro?: string; cidade?: string; uf?: string } | null;
  status: string | null;
  inscricao_estadual: string | null;
  inscricao_municipal: string | null;
  cnae_principal: string | null;
  natureza_juridica: string | null;
  regime_tributario: string | null;
  capital_social: number | null;
  erp_utilizado: string | null;
  banco_principal: string | null;
  site: string | null;
  instagram: string | null;
  linkedin: string | null;
  tags: string[] | null;
  email_nfe: string | null;
};

type Contato = {
  id: string;
  nome: string;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
  principal: boolean;
};

export default function ClienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [aba, setAba] = useState<AbaWorkspace>("visao-geral");

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [{ data: clienteData, error: clienteErro }, { data: contatosData }] = await Promise.all([
      supabase.from("clientes").select("*").eq("id", params.id).single(),
      supabase.from("clientes_contatos").select("*").eq("cliente_id", params.id),
    ]);

    if (clienteErro) setErro(clienteErro.message);
    setCliente(clienteData);
    setContatos(contatosData ?? []);
    setCarregando(false);
  }, [params.id]);

  useEffect(() => {
    if (params.id) carregar();
  }, [params.id, carregar]);

  async function excluir() {
    if (!cliente) return;
    if (!confirm(`Tem certeza que deseja excluir "${cliente.nome_fantasia ?? cliente.razao_social}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("clientes").delete().eq("id", cliente.id);
    setExcluindo(false);
    if (error) {
      alert(`Não foi possível excluir: ${error.message}`);
      return;
    }
    router.push("/clientes");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando cliente...
      </div>
    );
  }

  if (erro || !cliente) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-24 text-center text-[#9aa0ac] text-[13.5px]">
        Cliente não encontrado{erro ? `: ${erro}` : "."}
      </div>
    );
  }

  const nomeCliente = cliente.nome_fantasia ?? cliente.razao_social;
  const endereco = cliente.endereco
    ? [cliente.endereco.logradouro, cliente.endereco.cidade, cliente.endereco.uf].filter(Boolean).join(" — ")
    : "—";

  const formInicial: ClienteFormData = {
    id: cliente.id,
    razao_social: cliente.razao_social,
    nome_fantasia: cliente.nome_fantasia ?? "",
    cnpj: cliente.cnpj ?? "",
    segmento: cliente.segmento ?? "",
    porte: cliente.porte ?? "",
    num_funcionarios: cliente.num_funcionarios ? String(cliente.num_funcionarios) : "",
    faturamento: cliente.faturamento ? String(cliente.faturamento) : "",
    status: cliente.status ?? "Ativo",
    logradouro: cliente.endereco?.logradouro ?? "",
    cidade: cliente.endereco?.cidade ?? "",
    uf: cliente.endereco?.uf ?? "",
    inscricao_estadual: cliente.inscricao_estadual ?? "",
    inscricao_municipal: cliente.inscricao_municipal ?? "",
    cnae_principal: cliente.cnae_principal ?? "",
    natureza_juridica: cliente.natureza_juridica ?? "",
    regime_tributario: cliente.regime_tributario ?? "",
    capital_social: cliente.capital_social ? String(cliente.capital_social) : "",
    erp_utilizado: cliente.erp_utilizado ?? "",
    banco_principal: cliente.banco_principal ?? "",
    site: cliente.site ?? "",
    instagram: cliente.instagram ?? "",
    linkedin: cliente.linkedin ?? "",
    tags: (cliente.tags ?? []).join(", "),
    email_nfe: cliente.email_nfe ?? "",
  };

  return (
    <>
      <PageHeader
        crumb="Clientes"
        title={nomeCliente}
        secondaryLabel="Editar"
        onSecondaryClick={() => setModalAberto(true)}
        dangerLabel={excluindo ? "Excluindo..." : "Excluir"}
        onDangerClick={excluir}
      />

      <WorkspaceTabs ativa={aba} onChange={setAba} />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-5">
        {aba === "visao-geral" && (
          <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
            <div className="flex flex-col gap-3.5">
              <Card title="Identificação">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Razão social" value={cliente.razao_social} />
                  <Field label="CNPJ" value={cliente.cnpj ?? "—"} />
                  <Field label="Segmento" value={cliente.segmento ?? "—"} />
                  <Field label="Porte" value={cliente.porte ?? "—"} />
                  <Field label="Funcionários" value={cliente.num_funcionarios ? String(cliente.num_funcionarios) : "—"} />
                  <Field label="Faturamento" value={cliente.faturamento ? `R$ ${cliente.faturamento.toLocaleString("pt-BR")}` : "—"} />
                  <div className="col-span-2">
                    <Field label="Endereço" value={endereco} />
                  </div>
                </div>
              </Card>

              <Card title="Dados societários e fiscais">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Inscrição estadual" value={cliente.inscricao_estadual ?? "—"} />
                  <Field label="Inscrição municipal" value={cliente.inscricao_municipal ?? "—"} />
                  <Field label="CNAE principal" value={cliente.cnae_principal ?? "—"} />
                  <Field label="Natureza jurídica" value={cliente.natureza_juridica ?? "—"} />
                  <Field label="Regime tributário" value={cliente.regime_tributario ?? "—"} />
                  <Field label="Capital social" value={cliente.capital_social ? `R$ ${cliente.capital_social.toLocaleString("pt-BR")}` : "—"} />
                </div>
              </Card>

              <Card title="Ferramentas e presença digital">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="ERP utilizado" value={cliente.erp_utilizado ?? "—"} />
                  <Field label="Banco principal" value={cliente.banco_principal ?? "—"} />
                  <Field label="Site" value={cliente.site ?? "—"} />
                  <Field label="Instagram" value={cliente.instagram ?? "—"} />
                  <Field label="LinkedIn" value={cliente.linkedin ?? "—"} />
                </div>
                {(cliente.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[#f2f3f5]">
                    {(cliente.tags ?? []).map((tag) => (
                      <span key={tag} className="text-[11.5px] font-medium px-2 py-1 rounded-full bg-[#eaf1fb] text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Faturamento">
                <Field label="E-mail para envio de notas fiscais" value={cliente.email_nfe ?? "—"} />
              </Card>

              <Card title="Contatos principais">
                <div className="flex flex-col divide-y divide-[#f2f3f5]">
                  {contatos.map((c) => (
                    <div key={c.id} className="py-3 flex items-center gap-3">
                      <Avatar initials={c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")} size={32} />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold text-[#16181d]">{c.nome}</span>
                          {c.principal && <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />}
                        </div>
                        <div className="text-[12px] text-[#9aa0ac]">{c.cargo}</div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 text-[12px] text-[#5b6270]">
                        {c.telefone && <span className="flex items-center gap-1.5"><Phone size={12} />{c.telefone}</span>}
                        {c.email && <span className="flex items-center gap-1.5"><Mail size={12} />{c.email}</span>}
                      </div>
                    </div>
                  ))}
                  {contatos.length === 0 && (
                    <p className="text-[12.5px] text-[#9aa0ac] py-2">
                      Nenhum contato cadastrado ainda — use o botão &quot;Editar&quot; para adicionar.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-3.5">
              <Card title="Status">
                <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[cliente.status ?? "Ativo"]}`}>
                  {cliente.status ?? "Ativo"}
                </span>
              </Card>
            </div>
          </div>
        )}

        {aba === "timeline" && <ClienteTimelineTab clienteId={cliente.id} />}
        {aba === "kanban" && <ClienteKanbanTab clienteId={cliente.id} clienteNome={nomeCliente} />}
        {aba === "agenda" && <ClienteAgendaTab clienteId={cliente.id} />}
        {aba === "diagnostico" && <ClienteDiagnosticoTab clienteId={cliente.id} />}
        {aba === "financeiro" && <ClienteFinanceiroTab clienteId={cliente.id} clienteNome={nomeCliente} />}
        {aba === "arquivos" && <ArquivosPanel clienteId={cliente.id} />}
        {aba === "visitas" && <VisitasPanel clienteId={cliente.id} />}
        {aba === "plano-trabalho" && <ClientePlanoTrabalhoTab clienteId={cliente.id} />}
        {aba === "kpis" && <ClienteKpisTab clienteId={cliente.id} />}
      </div>

      <ClienteFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={carregar}
        clienteInicial={formInicial}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-[#9aa0ac] mb-1">{label}</div>
      <div className="text-[13.5px] text-[#16181d] font-medium">{value}</div>
    </div>
  );
}
