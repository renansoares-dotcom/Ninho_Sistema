"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Card from "./Card";

type Membro = {
  id: string;
  nome: string;
  cargo: string | null;
  reporta_a_id: string | null;
};

export default function ClienteOrganograma({ clienteId }: { clienteId: string }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [reportaA, setReportaA] = useState("");
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    carregar();
  }, [clienteId]);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("clientes_organograma")
      .select("id, nome, cargo, reporta_a_id")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: true });
    setMembros(data ?? []);
    setCarregando(false);
  }

  async function adicionar() {
    if (!nome.trim()) return;
    setAdicionando(true);
    await supabase.from("clientes_organograma").insert({
      cliente_id: clienteId,
      nome,
      cargo: cargo || null,
      reporta_a_id: reportaA || null,
    });
    setNome("");
    setCargo("");
    setReportaA("");
    setAdicionando(false);
    carregar();
  }

  async function remover(id: string) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("clientes_organograma").delete().eq("id", id);
  }

  function renderNivel(reportaAId: string | null, profundidade: number): React.ReactNode {
    const nivel = membros.filter((m) => m.reporta_a_id === reportaAId);
    return nivel.map((m) => (
      <div key={m.id}>
        <div
          className="flex items-center gap-2.5 py-2 group"
          style={{ paddingLeft: `${profundidade * 20}px` }}
        >
          <div className="w-7 h-7 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
            <User size={13} color="#004AAD" />
          </div>
          <div className="flex-1">
            <span className="text-[13px] font-medium text-[#16181d]">{m.nome}</span>
            {m.cargo && <span className="text-[12px] text-[#9aa0ac]"> — {m.cargo}</span>}
          </div>
          <button onClick={() => remover(m.id)} className="opacity-0 group-hover:opacity-100 text-[#c2c6cd] hover:text-[#f04438]">
            <X size={13} />
          </button>
        </div>
        {renderNivel(m.id, profundidade + 1)}
      </div>
    ));
  }

  return (
    <Card title="Organograma">
      {carregando ? (
        <div className="flex items-center gap-2 py-3 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#f2f3f5]">
          {membros.length === 0 ? (
            <p className="text-[12.5px] text-[#9aa0ac] py-2">Nenhum membro cadastrado ainda.</p>
          ) : (
            renderNivel(null, 0)
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <input
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          placeholder="Cargo"
          className="border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        />
        <select
          value={reportaA}
          onChange={(e) => setReportaA(e.target.value)}
          className="border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary"
        >
          <option value="">Reporta a...</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </div>
      <button
        onClick={adicionar}
        disabled={adicionando}
        className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f6f8] text-[#5b6270] hover:bg-[#eef0f2] disabled:opacity-60"
      >
        {adicionando ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        Adicionar membro
      </button>
    </Card>
  );
}
