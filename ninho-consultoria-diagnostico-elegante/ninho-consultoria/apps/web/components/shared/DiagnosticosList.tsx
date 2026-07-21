"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
};

export default function DiagnosticosList() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("diagnosticos")
        .select("id, data, status, indice_maturidade_geral, clientes(nome_fantasia, razao_social)")
        .order("data", { ascending: false });

      if (error) setErro(error.message);
      setDiagnosticos((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando diagnósticos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">
        Não foi possível carregar os diagnósticos: {erro}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#eef0f2]">
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Cliente</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Data</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Índice de maturidade</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {diagnosticos.map((d) => (
            <tr key={d.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors">
              <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">
                <Link href={`/diagnostico/${d.id}`} className="hover:underline">
                  {d.clientes?.nome_fantasia ?? d.clientes?.razao_social ?? "—"}
                </Link>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#5b6270]">
                {new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR")}
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
              <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-[#9aa0ac]">
                Nenhum diagnóstico registrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
