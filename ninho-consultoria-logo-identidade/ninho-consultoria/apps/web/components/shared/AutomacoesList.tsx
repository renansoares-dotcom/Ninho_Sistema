"use client";

import { useEffect, useState } from "react";
import { Zap, Loader2, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { rodarVerificacoesAutomaticas } from "@/lib/automacoes";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const gatilhoLabel: Record<string, string> = {
  diagnostico_concluido: "Ao concluir um diagnóstico",
  parcela_vencendo: "Parcela vencendo em até 3 dias",
  tarefa_atrasada: "Tarefa do Kanban com prazo vencido",
  nova_atividade_cliente: "Nova atividade registrada para o cliente",
  contrato_vencendo: "Contrato próximo do vencimento",
};

type Regra = { id: string; nome: string; gatilho: string; ativa: boolean };

export default function AutomacoesList() {
  const [regras, setRegras] = useState<Regra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [ultimaVerificacao, setUltimaVerificacao] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("automacoes_regras")
      .select("id, nome, gatilho, ativa")
      .eq("tenant_id", TENANT_ID)
      .order("nome");
    setRegras(data ?? []);
    setCarregando(false);
  }

  async function toggle(id: string, ativaAtual: boolean) {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ativa: !ativaAtual } : r)));
    await supabase.from("automacoes_regras").update({ ativa: !ativaAtual }).eq("id", id);
  }

  async function verificarAgora() {
    setVerificando(true);
    await rodarVerificacoesAutomaticas();
    setVerificando(false);
    setUltimaVerificacao(new Date().toLocaleTimeString("pt-BR"));
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando automações...
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center justify-between mb-4 bg-white border border-[#eef0f2] rounded-2xl p-4">
        <div>
          <div className="text-[13px] font-semibold text-[#16181d]">Verificações periódicas</div>
          <div className="text-[12px] text-[#9aa0ac] mt-0.5">
            Regras de "parcela vencendo" e "tarefa atrasada" rodam automaticamente ao abrir o Dashboard.
            {ultimaVerificacao && ` Última checagem manual: ${ultimaVerificacao}.`}
          </div>
        </div>
        <button
          onClick={verificarAgora}
          disabled={verificando}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60 shrink-0"
        >
          {verificando ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
          Verificar agora
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {regras.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
              <Zap size={18} color="#004AAD" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-[#16181d]">{r.nome}</div>
              <div className="text-[12px] text-[#9aa0ac] mt-0.5">
                Gatilho: {gatilhoLabel[r.gatilho] ?? r.gatilho}
              </div>
            </div>
            <button
              onClick={() => toggle(r.id, r.ativa)}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                r.ativa ? "bg-primary" : "bg-[#e4e6ea]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  r.ativa ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
