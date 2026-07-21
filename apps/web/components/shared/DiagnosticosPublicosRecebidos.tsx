"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, ChevronDown, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";

type Resposta = { pergunta_id: string; texto: string; peso: number; resposta: number };
type Lead = {
  id: string;
  nome: string;
  email: string;
  celular: string | null;
  nota: number;
  status: "Novo" | "Importado" | "Descartado";
  respostas: Resposta[];
  created_at: string;
};

function corPorNota(v: number) {
  if (v >= 8) return "#0e9f6e";
  if (v >= 5) return "#f59e0b";
  return "#f04438";
}

export default function DiagnosticosPublicosRecebidos() {
  const profile = useProfile();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("diagnosticos_publicos")
      .select("id, nome, email, celular, nota, status, respostas, created_at")
      .eq("status", "Novo")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setCarregando(false);
  }

  async function importar(lead: Lead) {
    setProcessandoId(lead.id);

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({ tenant_id: profile.tenant_id, razao_social: lead.nome, status: "Prospect" })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      alert("Não foi possível importar agora. Tente novamente.");
      setProcessandoId(null);
      return;
    }

    await supabase.from("clientes_contatos").insert({
      cliente_id: cliente.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.celular,
      principal: true,
    });

    await supabase.from("leads_oportunidades").insert({
      tenant_id: profile.tenant_id,
      empresa_nome: lead.nome,
      responsavel_nome: profile.nome,
      telefone: lead.celular,
      email: lead.email,
      origem: "Diagnóstico público",
      etapa: "lead",
      probabilidade: 20,
      cliente_id: cliente.id,
      observacoes: `Nota no diagnóstico público: ${lead.nota}/10`,
    });

    await supabase
      .from("diagnosticos_publicos")
      .update({ status: "Importado", cliente_id: cliente.id, importado_por: profile.id, importado_em: new Date().toISOString() })
      .eq("id", lead.id);

    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setProcessandoId(null);
  }

  async function descartar(id: string) {
    if (!confirm("Descartar esse diagnóstico recebido? Ele some da lista de pendentes.")) return;
    setProcessandoId(id);
    await supabase.from("diagnosticos_publicos").update({ status: "Descartado" }).eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setProcessandoId(null);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" /> Carregando...
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="py-12 text-center text-[13.5px] text-[#9aa0ac]">
        Nenhum diagnóstico público pendente de revisão.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[#f2f3f5]">
      {leads.map((lead) => {
        const aberto = abertoId === lead.id;
        const processando = processandoId === lead.id;
        return (
          <div key={lead.id} className="py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
                style={{ background: corPorNota(lead.nota) }}
              >
                {lead.nota.toFixed(1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-[#16181d]">{lead.nome}</div>
                <div className="flex items-center gap-3 text-[11.5px] text-[#9aa0ac] mt-0.5">
                  <span className="flex items-center gap-1"><Mail size={11} />{lead.email}</span>
                  {lead.celular && <span className="flex items-center gap-1"><Phone size={11} />{lead.celular}</span>}
                  <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <button
                onClick={() => setAbertoId(aberto ? null : lead.id)}
                className="text-[12px] font-medium text-[#767c88] flex items-center gap-1 shrink-0"
              >
                Ver respostas <ChevronDown size={13} className={aberto ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              <button
                onClick={() => descartar(lead.id)}
                disabled={processando}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#e4e6ea] text-[#767c88] disabled:opacity-50 shrink-0"
              >
                <X size={12} /> Descartar
              </button>
              <button
                onClick={() => importar(lead)}
                disabled={processando}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60 shrink-0"
              >
                {processando ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Importar
              </button>
            </div>

            {aberto && (
              <div className="mt-3 ml-[56px] flex flex-col gap-1.5">
                {lead.respostas.map((r) => (
                  <div key={r.pergunta_id} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[#5b6270]">{r.texto}</span>
                    <span className="font-semibold text-[#16181d] shrink-0 ml-3">{r.resposta}/10</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
