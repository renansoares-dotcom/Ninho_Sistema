"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Wallet, Stethoscope, CalendarDays, Users2, Loader2, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Notificacao = {
  id: string;
  tipo: string;
  titulo: string;
  lida: boolean;
  link: string | null;
  created_at: string;
};

const iconePorTipo: Record<string, any> = {
  financeiro: Wallet,
  diagnostico: Stethoscope,
  agenda: CalendarDays,
  crm: Users2,
  mensagem: MessageCircle,
};

export default function NotificationsBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregar();
    // A tabela não tem Realtime habilitado por padrão no Supabase, então
    // usamos um polling simples pra notificação de mensagem nova aparecer
    // sem precisar recarregar a página.
    const intervalo = setInterval(carregar, 25000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("notificacoes")
      .select("id, tipo, titulo, lida, link, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotificacoes(data ?? []);
    setCarregando(false);
  }

  async function marcarComoLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
  }

  async function marcarTodasComoLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    await supabase.from("notificacoes").update({ lida: true }).eq("lida", false);
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto((v) => !v)} className="relative">
        <Bell size={17} color="#5b6270" strokeWidth={1.8} />
        {naoLidas > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-[#f04438] border-[1.5px] border-white" />
        )}
      </button>

      {aberto && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#eef0f2] rounded-xl shadow-lg w-[340px] max-h-[420px] overflow-hidden z-30 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f2]">
            <span className="text-[13.5px] font-semibold text-[#16181d]">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasComoLidas} className="flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
                <Check size={12} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="overflow-y-auto">
            {carregando ? (
              <div className="flex items-center gap-2 px-4 py-4 text-[#9aa0ac] text-[12.5px]">
                <Loader2 size={13} className="animate-spin" />
                Carregando...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12.5px] text-[#9aa0ac]">Nenhuma notificação.</div>
            ) : (
              notificacoes.map((n) => {
                const Icon = iconePorTipo[n.tipo] ?? Bell;
                return (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => {
                      marcarComoLida(n.id);
                      setAberto(false);
                    }}
                    className={`flex items-start gap-2.5 px-4 py-2.5 border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] ${
                      !n.lida ? "bg-[#f7fafd]" : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
                      <Icon size={13} color="#004AAD" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[12.5px] ${!n.lida ? "font-semibold text-[#16181d]" : "text-[#5b6270]"}`}>
                        {n.titulo}
                      </div>
                      <div className="text-[11px] text-[#9aa0ac] mt-0.5">
                        {new Date(n.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    {!n.lida && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
