"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, User, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Card from "./Card";

type Membro = {
  id: string;
  nome: string;
  cargo: string | null;
  reporta_a_id: string | null;
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function No({
  membro,
  membros,
  onRemover,
}: {
  membro: Membro;
  membros: Membro[];
  onRemover: (id: string) => void;
}) {
  const filhos = membros.filter((m) => m.reporta_a_id === membro.id);

  return (
    <div className="flex flex-col items-center">
      <div className="group relative flex flex-col items-center gap-1.5 bg-white border border-[#e4e6ea] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#c2c6cd] transition-colors min-w-[140px]">
        <button
          onClick={() => onRemover(membro.id)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#e4e6ea] text-[#c2c6cd] hover:text-[#f04438] hover:border-[#f04438] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <X size={10} />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[11.5px] font-bold text-primary">
          {iniciais(membro.nome)}
        </div>
        <div className="text-center">
          <div className="text-[12.5px] font-semibold text-[#16181d] leading-tight">{membro.nome}</div>
          {membro.cargo && <div className="text-[11px] text-[#9aa0ac] leading-tight mt-0.5">{membro.cargo}</div>}
        </div>
      </div>

      {filhos.length > 0 && (
        <>
          <div className="w-px h-5 bg-[#d8dce2]" />
          <div className="flex items-start">
            {filhos.map((f, i) => (
              <div key={f.id} className="flex flex-col items-center px-4 relative">
                {filhos.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-[#d8dce2]"
                    style={{
                      left: i === 0 ? "50%" : 0,
                      right: i === filhos.length - 1 ? "50%" : 0,
                    }}
                  />
                )}
                <div className="w-px h-5 bg-[#d8dce2]" />
                <No membro={f} membros={membros} onRemover={onRemover} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ClienteOrganograma({ clienteId }: { clienteId: string }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [reportaA, setReportaA] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [formAberto, setFormAberto] = useState(false);

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
    await carregar();
  }

  async function remover(id: string) {
    // Quem reportava pra essa pessoa sobe um nível, em vez de sumir do gráfico
    const removido = membros.find((m) => m.id === id);
    setMembros((prev) =>
      prev
        .filter((m) => m.id !== id)
        .map((m) => (m.reporta_a_id === id ? { ...m, reporta_a_id: removido?.reporta_a_id ?? null } : m))
    );
    await supabase
      .from("clientes_organograma")
      .update({ reporta_a_id: removido?.reporta_a_id ?? null })
      .eq("reporta_a_id", id);
    await supabase.from("clientes_organograma").delete().eq("id", id);
  }

  const raizes = membros.filter((m) => !m.reporta_a_id || !membros.some((x) => x.id === m.reporta_a_id));

  return (
    <Card title="Organograma">
      {carregando ? (
        <div className="flex items-center gap-2 py-6 text-[#9aa0ac] text-[12.5px]">
          <Loader2 size={13} className="animate-spin" /> Carregando...
        </div>
      ) : membros.length === 0 ? (
        <p className="text-[12.5px] text-[#9aa0ac] py-4">Nenhum membro cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto py-2">
          <div className="flex items-start gap-8 justify-center min-w-fit px-2">
            {raizes.map((r) => (
              <No key={r.id} membro={r} membros={membros} onRemover={remover} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setFormAberto((v) => !v)}
        className="flex items-center gap-1.5 mt-3 text-[12px] font-medium text-[#5b6270] hover:text-primary"
      >
        <Plus size={13} /> Adicionar membro
        <ChevronDown size={12} className={formAberto ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {formAberto && (
        <div className="mt-2">
          <div className="grid grid-cols-3 gap-1.5">
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
            disabled={adicionando || !nome.trim()}
            className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-primary text-white disabled:opacity-60"
          >
            {adicionando ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Adicionar
          </button>
        </div>
      )}
    </Card>
  );
}
