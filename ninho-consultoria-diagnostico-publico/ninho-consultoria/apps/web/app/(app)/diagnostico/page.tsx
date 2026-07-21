"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import DiagnosticosList from "@/components/shared/DiagnosticosList";
import DiagnosticoRadarChart from "@/components/charts/DiagnosticoRadarChart";
import DiagnosticosPublicosRecebidos from "@/components/shared/DiagnosticosPublicosRecebidos";
import { supabase } from "@/lib/supabase";

export default function DiagnosticoPage() {
  const [aba, setAba] = useState<"diagnosticos" | "recebidos">("diagnosticos");
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    async function contar() {
      const { count } = await supabase
        .from("diagnosticos_publicos")
        .select("id", { count: "exact", head: true })
        .eq("status", "Novo");
      setPendentes(count ?? 0);
    }
    contar();
  }, [aba]);

  return (
    <>
      <PageHeader crumb="Início" title="Diagnóstico Empresarial" actionLabel="Novo diagnóstico" actionHref="/diagnostico/novo" />

      <div className="max-w-[1360px] mx-auto px-7 pt-3">
        <div className="flex items-center gap-1 border-b border-[#eef0f2]">
          <button
            onClick={() => setAba("diagnosticos")}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px ${
              aba === "diagnosticos" ? "border-primary text-primary" : "border-transparent text-[#767c88]"
            }`}
          >
            Diagnósticos
          </button>
          <button
            onClick={() => setAba("recebidos")}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px flex items-center gap-1.5 ${
              aba === "recebidos" ? "border-primary text-primary" : "border-transparent text-[#767c88]"
            }`}
          >
            Recebidos (link público)
            {pendentes > 0 && (
              <span className="bg-[#f04438] text-white text-[10.5px] font-bold px-1.5 py-0.5 rounded-full">{pendentes}</span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
        {aba === "diagnosticos" ? (
          <div className="grid grid-cols-[1fr_1.1fr] gap-3.5">
            <Card title="Diagnósticos recentes">
              <DiagnosticosList />
            </Card>
            <Card title="Radar por área — Grupo Alvorada">
              <DiagnosticoRadarChart />
            </Card>
          </div>
        ) : (
          <Card title="Diagnósticos recebidos pelo link público">
            <DiagnosticosPublicosRecebidos />
          </Card>
        )}
      </div>
    </>
  );
}
