"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Square, RotateCcw } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";
import { ROLES_GESTAO } from "@/lib/auth/permissions";

type Campanha = { id: string; titulo: string; ativa: boolean; created_at: string };
type Resposta = {
  cliente_id: string;
  data: string;
  indice_maturidade_geral: number | null;
  clientes: { nome_fantasia: string | null; razao_social: string } | null;
};

export default function CampanhaAcompanhamentoPanel() {
  const profile = useProfile();
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [liberados, setLiberados] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [tituloNovo, setTituloNovo] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data: atual } = await supabase
      .from("diagnostico_campanhas")
      .select("id, titulo, ativa, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCampanha(atual ?? null);

    if (atual) {
      const [{ data: dataRespostas }, { data: dataLiberacoes }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("cliente_id, data, indice_maturidade_geral, clientes(nome_fantasia, razao_social)")
          .eq("campanha_id", atual.id)
          .order("data", { ascending: false }),
        supabase.from("diagnostico_campanha_liberacoes").select("cliente_id").eq("campanha_id", atual.id),
      ]);
      setRespostas((dataRespostas as unknown as Resposta[]) ?? []);
      setLiberados(new Set((dataLiberacoes ?? []).map((l) => l.cliente_id)));
    } else {
      setRespostas([]);
      setLiberados(new Set());
    }
    setCarregando(false);
  }

  if (!ROLES_GESTAO.includes(profile.role)) return null;

  async function abrirCampanha() {
    if (!tituloNovo.trim()) return;
    setSalvando(true);
    await supabase.from("diagnostico_campanhas").update({ ativa: false }).eq("ativa", true);
    await supabase.from("diagnostico_campanhas").insert({
      titulo: tituloNovo.trim(),
      ativa: true,
      criada_por: profile.id,
    });
    setTituloNovo("");
    setSalvando(false);
    carregar();
  }

  async function encerrarCampanha() {
    if (!campanha) return;
    if (!confirm(`Encerrar a campanha "${campanha.titulo}"? Os clientes deixam de ver o formulário no Portal.`)) return;
    setSalvando(true);
    await supabase
      .from("diagnostico_campanhas")
      .update({ ativa: false, encerrada_em: new Date().toISOString() })
      .eq("id", campanha.id);
    setSalvando(false);
    carregar();
  }

  async function liberarReenvio(clienteId: string) {
    if (!campanha) return;
    await supabase.from("diagnostico_campanha_liberacoes").insert({
      campanha_id: campanha.id,
      cliente_id: clienteId,
      liberado_por: profile.id,
    });
    setLiberados((prev) => new Set(prev).add(clienteId));
  }

  return (
    <Card title="Diagnóstico de Acompanhamento (Portal do Cliente)">
      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-8 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : campanha?.ativa ? (
        <div>
          <div className="flex items-center justify-between bg-[#eafaf1] rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Megaphone size={16} className="text-[#0e9f6e]" />
              <div>
                <div className="text-[13px] font-semibold text-[#16181d]">{campanha.titulo}</div>
                <div className="text-[11.5px] text-[#0e9f6e]">Campanha ativa — visível no Portal de todos os clientes</div>
              </div>
            </div>
            <button
              onClick={encerrarCampanha}
              disabled={salvando}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border border-[#e4e6ea] bg-white text-[#3f434d] disabled:opacity-60"
            >
              <Square size={12} /> Encerrar campanha
            </button>
          </div>

          <div className="text-[12.5px] font-semibold text-[#16181d] mb-2">
            Respostas recebidas ({respostas.length})
          </div>
          {respostas.length === 0 ? (
            <div className="text-[12.5px] text-[#9aa0ac] py-4 text-center">Nenhum cliente respondeu ainda.</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f2f3f5]">
              {respostas.map((r) => (
                <div key={r.cliente_id + r.data} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[12.5px] font-medium text-[#16181d]">
                      {r.clientes?.nome_fantasia || r.clientes?.razao_social}
                    </div>
                    <div className="text-[11px] text-[#9aa0ac]">
                      {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR")} · nota {r.indice_maturidade_geral ?? "—"}
                    </div>
                  </div>
                  <button
                    onClick={() => liberarReenvio(r.cliente_id)}
                    disabled={liberados.has(r.cliente_id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium border border-[#e4e6ea] text-[#3f434d] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={12} />
                    {liberados.has(r.cliente_id) ? "Reenvio liberado" : "Liberar novo envio"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-[12.5px] text-[#767c88] mb-3">
            Nenhuma campanha ativa no momento. Abra uma pra liberar o formulário de acompanhamento
            (9 áreas, igual ao diagnóstico interno) pra todos os clientes no Portal.
          </p>
          <div className="flex items-center gap-2">
            <input
              value={tituloNovo}
              onChange={(e) => setTituloNovo(e.target.value)}
              placeholder='Ex: "Acompanhamento — 3º trimestre 2026"'
              className="flex-1 border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13px] text-[#16181d] outline-none focus:border-primary"
            />
            <button
              onClick={abrirCampanha}
              disabled={salvando || !tituloNovo.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60 shrink-0"
            >
              {salvando ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
              Abrir campanha
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
