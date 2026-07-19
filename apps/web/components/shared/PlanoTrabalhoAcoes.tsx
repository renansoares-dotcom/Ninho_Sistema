"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Avatar } from "./Avatar";
import PlanoAcaoFormModal, { PlanoAcaoFormData } from "./PlanoAcaoFormModal";

const statusIcon: Record<string, any> = {
  "Concluído": CheckCircle2,
  "Em andamento": Clock,
  "Pendente": AlertOctagon,
};

const statusCor: Record<string, string> = {
  "Concluído": "#0e9f6e",
  "Em andamento": "#004AAD",
  "Pendente": "#9aa0ac",
};

const prioridadeStyles: Record<string, string> = {
  Alta: "bg-[#fdecea] text-[#f04438]",
  Média: "bg-[#fff6e6] text-[#b45309]",
  Baixa: "bg-[#f5f6f8] text-[#767c88]",
};

type Acao = {
  id: string;
  titulo: string;
  responsavel_nome: string | null;
  prioridade: string;
  prazo: string | null;
  status: string;
  observacoes: string | null;
};

export default function PlanoTrabalhoAcoes({ planoId }: { planoId: string }) {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState<PlanoAcaoFormData | undefined>(undefined);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("plano_acoes")
        .select("id, titulo, responsavel_nome, prioridade, prazo, status, observacoes")
        .eq("plano_id", planoId)
        .order("created_at", { ascending: true });
      setAcoes(data ?? []);
      setCarregando(false);
    }
    carregar();
  }, [planoId, internalRefresh]);

  function abrirNova() {
    setAcaoSelecionada(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(a: Acao) {
    setAcaoSelecionada({
      id: a.id,
      titulo: a.titulo,
      responsavel_nome: a.responsavel_nome ?? "",
      prioridade: a.prioridade,
      prazo: a.prazo ?? "",
      status: a.status,
      observacoes: a.observacoes ?? "",
    });
    setModalAberto(true);
  }

  const concluidas = acoes.filter((a) => a.status === "Concluído").length;
  const progresso = acoes.length > 0 ? Math.round((concluidas / acoes.length) * 100) : 0;

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando plano de trabalho...
      </div>
    );
  }

  return (
    <div>
      {acoes.length > 0 && (
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-[#16181d]">Progresso do plano</span>
            <span className="text-[13px] font-bold text-primary">{progresso}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#f0f1f3] overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
          </div>
          <div className="text-[11.5px] text-[#9aa0ac] mt-1.5">{concluidas} de {acoes.length} ações concluídas</div>
        </div>
      )}

      <div className="flex justify-end mb-3">
        <button
          onClick={abrirNova}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold bg-primary text-white shadow-sm"
        >
          <Plus size={14} />
          Nova ação
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {acoes.map((a) => {
          const StatusIcon = statusIcon[a.status] ?? AlertOctagon;
          return (
            <button
              key={a.id}
              onClick={() => abrirEdicao(a)}
              className="text-left bg-white border border-[#eef0f2] rounded-xl p-3.5 flex items-center gap-3 hover:border-[#d8dce2] transition-colors w-full"
            >
              <StatusIcon size={16} color={statusCor[a.status]} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-medium ${a.status === "Concluído" ? "line-through text-[#9aa0ac]" : "text-[#16181d]"}`}>
                  {a.titulo}
                </div>
                {a.prazo && (
                  <div className="text-[11.5px] text-[#9aa0ac] mt-0.5">
                    Prazo: {new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${prioridadeStyles[a.prioridade]}`}>
                {a.prioridade}
              </span>
              {a.responsavel_nome && <Avatar initials={a.responsavel_nome} size={24} />}
            </button>
          );
        })}
        {acoes.length === 0 && (
          <p className="text-[13.5px] text-[#9aa0ac] text-center py-14">Nenhuma ação cadastrada ainda neste plano.</p>
        )}
      </div>

      <PlanoAcaoFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSaved={() => setInternalRefresh((k) => k + 1)}
        onDeleted={() => setInternalRefresh((k) => k + 1)}
        planoId={planoId}
        acaoInicial={acaoSelecionada}
      />
    </div>
  );
}
