"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  "Concluído": "bg-[#eafaf1] text-[#0e9f6e]",
  "Em andamento": "bg-[#eaf1fb] text-primary",
  "Em preenchimento": "bg-[#f5f6f8] text-[#767c88]",
};

type DiagnosticoRow = {
  id: string;
  data: string;
  status: string;
  indice_maturidade_geral: number | null;
};

export default function ClienteDiagnosticoTab({ clienteId }: { clienteId: string }) {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRow[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("diagnosticos")
        .select("id, data, status, indice_maturidade_geral")
        .eq("cliente_id", clienteId)
        .order("data", { ascending: false });
      setDiagnosticos(data ?? []);
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando diagnósticos...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Link
          href={`/diagnostico/novo?cliente=${clienteId}`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Novo diagnóstico
        </Link>
      </div>

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Data</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Índice</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {diagnosticos.map((d) => (
              <tr key={d.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors">
                <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">
                  <Link href={`/diagnostico/${d.id}`} className="hover:underline">
                    {new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </Link>
                </td>
                <td className="px-5 py-4 text-[13px] font-semibold text-[#16181d]">
                  {d.indice_maturidade_geral ? `${d.indice_maturidade_geral.toFixed(1)} / 10` : "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[d.status] ?? statusStyles["Em preenchimento"]}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
            {diagnosticos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-[13px] text-[#9aa0ac]">
                  Nenhum diagnóstico realizado ainda para este cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
