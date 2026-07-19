"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Stethoscope, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Relatorio = {
  id: string;
  tipo: "Diagnóstico" | "Plano de Trabalho";
  titulo: string;
  data: string;
  href: string;
};

const tipoIcon: Record<string, any> = {
  "Diagnóstico": Stethoscope,
  "Plano de Trabalho": ClipboardList,
};

const tipoStyles: Record<string, string> = {
  "Diagnóstico": "bg-[#eaf1fb] text-primary",
  "Plano de Trabalho": "bg-[#f3e8fd] text-[#9333ea]",
};

export default function RelatoriosList() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [{ data: diagnosticos }, { data: planos }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("id, data, status, clientes(nome_fantasia, razao_social)")
          .order("data", { ascending: false }),
        supabase
          .from("planos_trabalho")
          .select("id, created_at, status, clientes(nome_fantasia, razao_social)")
          .order("created_at", { ascending: false }),
      ]);

      const lista: Relatorio[] = [
        ...(diagnosticos ?? []).map((d: any) => ({
          id: d.id,
          tipo: "Diagnóstico" as const,
          titulo: `Diagnóstico — ${d.clientes?.nome_fantasia ?? d.clientes?.razao_social ?? "Cliente"}`,
          data: d.data,
          href: `/diagnostico/${d.id}`,
        })),
        ...(planos ?? []).map((p: any) => ({
          id: p.id,
          tipo: "Plano de Trabalho" as const,
          titulo: `Plano de Trabalho — ${p.clientes?.nome_fantasia ?? p.clientes?.razao_social ?? "Cliente"}`,
          data: p.created_at,
          href: `/plano-trabalho/${p.id}`,
        })),
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      setRelatorios(lista);
      setCarregando(false);
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex items-center justify-center gap-2 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando relatórios...
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <p className="text-[12.5px] text-[#9aa0ac] mb-4">
        Abra qualquer item para visualizar e usar o botão &quot;Gerar PDF&quot; na tela de detalhe.
      </p>
      <div className="flex flex-col gap-2.5">
        {relatorios.map((r) => {
          const Icon = tipoIcon[r.tipo];
          return (
            <Link
              key={`${r.tipo}-${r.id}`}
              href={r.href}
              className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] hover:border-[#d8dce2] transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#f5f6f8] flex items-center justify-center shrink-0">
                <Icon size={18} color="#5b6270" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-[#16181d]">{r.titulo}</div>
                <div className="text-[12px] text-[#9aa0ac] mt-0.5">
                  {new Date(r.data).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${tipoStyles[r.tipo]}`}>
                {r.tipo}
              </span>
              <FileText size={15} className="text-[#c2c6cd]" />
            </Link>
          );
        })}
        {relatorios.length === 0 && (
          <p className="text-[13.5px] text-[#9aa0ac] text-center py-14">Nenhum relatório disponível ainda.</p>
        )}
      </div>
    </div>
  );
}
