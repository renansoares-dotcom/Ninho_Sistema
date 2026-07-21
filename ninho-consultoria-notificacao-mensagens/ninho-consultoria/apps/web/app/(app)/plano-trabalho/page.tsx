"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { supabase } from "@/lib/supabase";

type PlanoRow = {
  id: string;
  status: string;
  created_at: string;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
  plano_acoes: { status: string }[];
};

const statusStyles: Record<string, string> = {
  Ativo: "bg-[#eaf1fb] text-primary",
  Concluído: "bg-[#eafaf1] text-[#0e9f6e]",
};

export default function PlanoTrabalhoPage() {
  const [planos, setPlanos] = useState<PlanoRow[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("planos_trabalho")
        .select("id, status, created_at, clientes(nome_fantasia, razao_social), plano_acoes(status)")
        .order("created_at", { ascending: false });
      setPlanos((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  return (
    <>
      <PageHeader crumb="Início" title="Plano de Trabalho" />
      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
        {carregando ? (
          <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
            <Loader2 size={16} className="animate-spin" />
            Carregando planos de trabalho...
          </div>
        ) : (
          <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f2]">
                  <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Progresso</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {planos.map((p) => {
                  const total = p.plano_acoes.length;
                  const concluidas = p.plano_acoes.filter((a) => a.status === "Concluído").length;
                  const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
                  return (
                    <tr key={p.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc]">
                      <td className="px-5 py-3.5 text-[13.5px] font-medium text-[#16181d]">
                        <Link href={`/plano-trabalho/${p.id}`} className="hover:underline">
                          {p.clientes?.nome_fantasia ?? p.clientes?.razao_social ?? "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 w-[140px]">
                          <div className="h-1.5 flex-1 rounded-full bg-[#f0f1f3] overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progresso}%` }} />
                          </div>
                          <span className="text-[11.5px] text-[#9aa0ac] w-8">{progresso}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyles[p.status] ?? statusStyles.Ativo}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#9aa0ac]">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
                {planos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center text-[13.5px] text-[#9aa0ac]">
                      Nenhum plano de trabalho criado ainda — gere um a partir de um diagnóstico concluído.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
