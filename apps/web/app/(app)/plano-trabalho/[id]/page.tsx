"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import PlanoTrabalhoAcoes from "@/components/shared/PlanoTrabalhoAcoes";
import { supabase } from "@/lib/supabase";

type Plano = {
  id: string;
  status: string;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
};

export default function PlanoTrabalhoDetalhePage() {
  const params = useParams<{ id: string }>();
  const [plano, setPlano] = useState<Plano | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("planos_trabalho")
        .select("id, status, clientes(nome_fantasia, razao_social)")
        .eq("id", params.id)
        .single();
      setPlano(data as any);
      setCarregando(false);
    }
    if (params.id) carregar();
  }, [params.id]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando plano de trabalho...
      </div>
    );
  }

  if (!plano) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-24 text-center text-[#9aa0ac] text-[13.5px]">
        Plano de trabalho não encontrado.
      </div>
    );
  }

  const nomeCliente = plano.clientes?.nome_fantasia ?? plano.clientes?.razao_social ?? "Cliente";

  return (
    <>
      <PageHeader
        crumb="Plano de Trabalho"
        title={`Plano de Trabalho — ${nomeCliente}`}
        secondaryLabel="Gerar PDF"
        onSecondaryClick={() => window.print()}
      />
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 print-area">
        <div className="hidden print:block mb-4">
          <div className="text-[18px] font-bold text-[#16181d]">Plano de Trabalho — {nomeCliente}</div>
          <div className="text-[12px] text-[#767c88]">Gerado em {new Date().toLocaleDateString("pt-BR")}</div>
        </div>
        <PlanoTrabalhoAcoes planoId={plano.id} />
      </div>
    </>
  );
}
