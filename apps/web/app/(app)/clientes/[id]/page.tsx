"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Phone, Mail, Star, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Avatar } from "@/components/shared/Avatar";
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
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: clienteData, error: clienteErro }, { data: contatosData }] = await Promise.all([
        supabase.from("clientes").select("*").eq("id", params.id).single(),
        supabase.from("clientes_contatos").select("*").eq("cliente_id", params.id),
      ]);

      if (clienteErro) setErro(clienteErro.message);
      setCliente(clienteData);
      setContatos(contatosData ?? []);
      setCarregando(false);
    }
    if (params.id) carregar();
  }, [params.id]);

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

  const endereco = cliente.endereco
    ? [cliente.endereco.logradouro, cliente.endereco.cidade, cliente.endereco.uf].filter(Boolean).join(" — ")
    : "—";

  return (
    <>
      <PageHeader
        crumb="Clientes"
        title={cliente.nome_fantasia ?? cliente.razao_social}
        secondaryLabel="Editar"
        actionLabel="Registrar visita"
      />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
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
