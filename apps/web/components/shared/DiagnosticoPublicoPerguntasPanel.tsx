"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";
import { ROLES_GESTAO } from "@/lib/auth/permissions";

type Pergunta = { id: string; texto: string; peso: number; ordem: number; ativa: boolean };

export default function DiagnosticoPublicoPerguntasPanel() {
  const profile = useProfile();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("diagnostico_publico_perguntas")
      .select("id, texto, peso, ordem, ativa")
      .order("ordem", { ascending: true });
    setPerguntas((data as Pergunta[]) ?? []);
    setCarregando(false);
  }

  if (!ROLES_GESTAO.includes(profile.role)) return null;

  const somaPesos = perguntas.filter((p) => p.ativa).reduce((s, p) => s + Number(p.peso), 0);
  const somaOk = Math.abs(somaPesos - 10) < 0.01;

  async function salvarCampo(id: string, campo: "texto" | "peso", valor: string | number) {
    setPerguntas((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
    await supabase.from("diagnostico_publico_perguntas").update({ [campo]: valor }).eq("id", id);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir essa pergunta do diagnóstico público?")) return;
    setPerguntas((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("diagnostico_publico_perguntas").delete().eq("id", id);
  }

  async function mover(id: string, direcao: -1 | 1) {
    const idx = perguntas.findIndex((p) => p.id === id);
    const vizinho = perguntas[idx + direcao];
    if (!vizinho) return;
    const atual = perguntas[idx];
    const novaLista = [...perguntas];
    novaLista[idx] = { ...atual, ordem: vizinho.ordem };
    novaLista[idx + direcao] = { ...vizinho, ordem: atual.ordem };
    novaLista.sort((a, b) => a.ordem - b.ordem);
    setPerguntas(novaLista);
    await Promise.all([
      supabase.from("diagnostico_publico_perguntas").update({ ordem: vizinho.ordem }).eq("id", atual.id),
      supabase.from("diagnostico_publico_perguntas").update({ ordem: atual.ordem }).eq("id", vizinho.id),
    ]);
  }

  async function adicionar() {
    setAdicionando(true);
    const maxOrdem = perguntas.reduce((m, p) => Math.max(m, p.ordem), 0);
    const { data } = await supabase
      .from("diagnostico_publico_perguntas")
      .insert({ texto: "Nova pergunta — edite o texto aqui", peso: 0, ordem: maxOrdem + 1, ativa: true })
      .select("id, texto, peso, ordem, ativa")
      .single();
    if (data) setPerguntas((prev) => [...prev, data as Pergunta]);
    setAdicionando(false);
  }

  return (
    <Card
      title="Perguntas do Diagnóstico Público"
      action={
        <button
          onClick={adicionar}
          disabled={adicionando}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
        >
          {adicionando ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Nova pergunta
        </button>
      }
    >
      <p className="text-[12.5px] text-[#767c88] mb-3">
        Essas são as perguntas mostradas no link público de captação de leads. Os pesos precisam
        somar exatamente <strong>10</strong> entre as perguntas ativas — é o que define a nota final de 0 a 10.
      </p>

      <div
        className={`flex items-center gap-2 text-[12.5px] font-medium px-3 py-2 rounded-lg mb-4 ${
          somaOk ? "bg-[#eafaf1] text-[#0e9f6e]" : "bg-[#fff7e6] text-[#e08a00]"
        }`}
      >
        {somaOk ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
        Soma dos pesos (perguntas ativas): {somaPesos.toFixed(1)} / 10 {!somaOk && "— ajuste antes de divulgar o link"}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-8 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#f2f3f5]">
          {perguntas.map((p, i) => (
            <div key={p.id} className="py-3 flex items-center gap-2.5">
              <div className="flex flex-col shrink-0">
                <button onClick={() => mover(p.id, -1)} disabled={i === 0} className="text-[#c2c6cd] hover:text-primary disabled:opacity-30">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => mover(p.id, 1)} disabled={i === perguntas.length - 1} className="text-[#c2c6cd] hover:text-primary disabled:opacity-30">
                  <ArrowDown size={13} />
                </button>
              </div>
              <input
                defaultValue={p.texto}
                onBlur={(e) => e.target.value !== p.texto && salvarCampo(p.id, "texto", e.target.value)}
                className="flex-1 border border-[#e4e6ea] rounded-lg px-3 py-2 text-[13px] text-[#16181d] outline-none focus:border-primary"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={10}
                  defaultValue={p.peso}
                  onBlur={(e) => salvarCampo(p.id, "peso", Number(e.target.value))}
                  className="w-16 border border-[#e4e6ea] rounded-lg px-2 py-2 text-[13px] text-[#16181d] outline-none focus:border-primary text-center"
                />
                <span className="text-[11.5px] text-[#9aa0ac]">pts</span>
              </div>
              <button onClick={() => excluir(p.id)} className="text-[#c2c6cd] hover:text-[#f04438] shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {perguntas.length === 0 && (
            <div className="py-8 text-center text-[13px] text-[#9aa0ac]">Nenhuma pergunta cadastrada ainda.</div>
          )}
        </div>
      )}
    </Card>
  );
}
