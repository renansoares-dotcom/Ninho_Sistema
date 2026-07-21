"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PlanoRow = {
  id: string;
  status: string;
  created_at: string;
  plano_acoes: { status: string }[];
};

export default function ClientePlanoTrabalhoTab({ clienteId }: { clienteId: string }) {
  const [planos, setPlanos] = useState<PlanoRow[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("planos_trabalho")
        .select("id, status, created_at, plano_acoes(status)")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      setPlanos((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando planos de trabalho...
      </div>
    );
  }

  if (planos.length === 0) {
    return (
      <div className="py-14 text-center text-[13.5px] text-[#9aa0ac]">
        Nenhum plano de trabalho ainda. Gere um a partir de um diagnóstico concluído deste cliente.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {planos.map((p) => {
        const total = p.plano_acoes.length;
        const concluidas = p.plano_acoes.filter((a) => a.status === "Concluído").length;
        const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        return (
          <Link
            key={p.id}
            href={`/plano-trabalho/${p.id}`}
            className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] hover:border-[#d8dce2] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
              <ClipboardList size={17} color="#004AAD" />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-[#16181d]">
                Plano de Trabalho — {p.status}
              </div>
              <div className="text-[12px] text-[#9aa0ac] mt-0.5">
                {concluidas} de {total} ações concluídas
              </div>
            </div>
            <div className="w-[100px]">
              <div className="h-1.5 rounded-full bg-[#f0f1f3] overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progresso}%` }} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
