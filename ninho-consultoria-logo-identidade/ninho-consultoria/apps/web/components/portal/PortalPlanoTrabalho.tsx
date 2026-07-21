"use client";

import { useEffect, useState } from "react";
import { Loader2, ClipboardList, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePortal } from "./PortalContext";

type Acao = {
  id: string;
  titulo: string;
  responsavel_nome: string | null;
  prioridade: string;
  prazo: string | null;
  status: string;
  observacoes: string | null;
};
type Plano = { id: string; status: string; created_at: string; plano_acoes: Acao[] };

const statusStyles: Record<string, string> = {
  "Concluído": "bg-[#eafaf1] text-[#0e9f6e]",
  "Em andamento": "bg-[#eaf1fb] text-primary",
  "Pendente": "bg-[#f5f6f8] text-[#767c88]",
  "Atrasado": "bg-[#fdecea] text-[#f04438]",
};

export default function PortalPlanoTrabalho() {
  const { clienteId } = usePortal();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abertoId, setAbertoId] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("planos_trabalho")
        .select("id, status, created_at, plano_acoes(id, titulo, responsavel_nome, prioridade, prazo, status, observacoes)")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      const lista = (data as unknown as Plano[]) ?? [];
      setPlanos(lista);
      if (lista[0]) setAbertoId(lista[0].id);
      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  return (
    <div className="max-w-[1100px] mx-auto px-7 py-7 flex flex-col gap-4">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Plano de Trabalho</h1>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : planos.length === 0 ? (
        <div className="bg-white border border-[#eef0f2] rounded-2xl py-16 text-center text-[13.5px] text-[#9aa0ac]">
          Nenhum plano de trabalho publicado ainda. Assim que seu consultor definir os próximos passos, eles aparecem aqui.
        </div>
      ) : (
        planos.map((p) => {
          const total = p.plano_acoes.length;
          const concluidas = p.plano_acoes.filter((a) => a.status === "Concluído").length;
          const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
          const aberto = abertoId === p.id;
          return (
            <div key={p.id} className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden">
              <button
                onClick={() => setAbertoId(aberto ? null : p.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#eaf1fb] flex items-center justify-center shrink-0">
                  <ClipboardList size={17} color="#004AAD" />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-[#16181d]">Plano de Trabalho — {p.status}</div>
                  <div className="text-[12px] text-[#9aa0ac] mt-0.5">{concluidas} de {total} ações concluídas</div>
                </div>
                <div className="w-[100px]">
                  <div className="h-1.5 rounded-full bg-[#f0f1f3] overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progresso}%` }} />
                  </div>
                </div>
                <ChevronDown size={16} className={`text-[#9aa0ac] transition-transform ${aberto ? "rotate-180" : ""}`} />
              </button>

              {aberto && (
                <div className="border-t border-[#f2f3f5] divide-y divide-[#f2f3f5]">
                  {p.plano_acoes.map((a) => (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyles[a.status] ?? statusStyles["Pendente"]}`}>
                        {a.status}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#16181d] truncate">{a.titulo}</div>
                        {a.observacoes && <div className="text-[12px] text-[#9aa0ac] truncate">{a.observacoes}</div>}
                      </div>
                      {a.responsavel_nome && (
                        <span className="text-[11.5px] text-[#767c88] shrink-0">{a.responsavel_nome}</span>
                      )}
                      {a.prazo && (
                        <span className="text-[11.5px] text-[#9aa0ac] shrink-0">
                          {new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  ))}
                  {p.plano_acoes.length === 0 && (
                    <div className="px-4 py-6 text-center text-[12.5px] text-[#9aa0ac]">Nenhuma ação cadastrada ainda.</div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
