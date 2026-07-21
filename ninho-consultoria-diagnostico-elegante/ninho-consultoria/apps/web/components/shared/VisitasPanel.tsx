"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import VisitaFormModal, { VisitaFormData } from "./VisitaFormModal";

type Visita = {
  id: string;
  cliente_id: string;
  data: string;
  hora: string | null;
  objetivo: string | null;
  relato: string | null;
  decisoes: string | null;
  pendencias: string | null;
  clientes?: { nome_fantasia: string | null; razao_social: string } | null;
};

export default function VisitasPanel({ clienteId }: { clienteId?: string }) {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [visitaSelecionada, setVisitaSelecionada] = useState<VisitaFormData | undefined>(undefined);

  useEffect(() => {
    if (!clienteId && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("novo") === "1") {
      setModalAberto(true);
    }
  }, [clienteId]);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      let sel = supabase
        .from("visitas")
        .select("id, cliente_id, data, hora, objetivo, relato, decisoes, pendencias, clientes(nome_fantasia, razao_social)")
        .order("data", { ascending: false });

      if (clienteId) sel = sel.eq("cliente_id", clienteId);

      const { data } = await sel;
      setVisitas((data as any) ?? []);
      setCarregando(false);
    }
    carregar();
  }, [clienteId, internalRefresh]);

  function abrirNova() {
    setVisitaSelecionada(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(v: Visita) {
    setVisitaSelecionada({
      id: v.id,
      cliente_id: v.cliente_id,
      data: v.data,
      hora: v.hora ?? "09:00",
      objetivo: v.objetivo ?? "",
      relato: v.relato ?? "",
      decisoes: v.decisoes ?? "",
      pendencias: v.pendencias ?? "",
    });
    setModalAberto(true);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando visitas...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={abrirNova}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <MapPin size={14} />
          Nova visita
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {visitas.map((v) => (
          <button
            key={v.id}
            onClick={() => abrirEdicao(v)}
            className="text-left bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-start gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] hover:border-[#d8dce2] transition-colors w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
              <MapPin size={17} color="#004AAD" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-[#16181d]">
                  {!clienteId && (v.clientes?.nome_fantasia ?? v.clientes?.razao_social)}
                  {!clienteId && v.objetivo && " — "}
                  {v.objetivo ?? "Visita técnica"}
                </span>
                <span className="text-[12px] text-[#9aa0ac] shrink-0">
                  {new Date(v.data + "T12:00:00").toLocaleDateString("pt-BR")} {v.hora?.slice(0, 5)}
                </span>
              </div>
              {v.relato && <p className="text-[12.5px] text-[#767c88] mt-1 line-clamp-2">{v.relato}</p>}
              {v.pendencias && (
                <div className="text-[11.5px] text-[#b45309] bg-[#fff6e6] rounded-lg px-2 py-1 mt-2 inline-block">
                  Pendências: {v.pendencias}
                </div>
              )}
            </div>
          </button>
        ))}
        {visitas.length === 0 && (
          <p className="text-[13.5px] text-[#9aa0ac] text-center py-14">Nenhuma visita registrada ainda.</p>
        )}
      </div>

      <VisitaFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        onDeleted={() => setInternalRefresh((k) => k + 1)}
        visitaInicial={visitaSelecionada}
        clienteIdFixo={clienteId}
      />
    </div>
  );
}
