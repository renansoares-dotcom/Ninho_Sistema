"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  LayoutDashboard,
  Users2,
  Building2,
  KanbanSquare,
  Stethoscope,
  CalendarDays,
  Wallet,
  Receipt,
  ClipboardList,
  MapPin,
  Folder,
  FileText,
  Zap,
  Settings,
  Plus,
  CornerDownLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Comando = {
  id: string;
  titulo: string;
  subtitulo?: string;
  icon: any;
  onSelect: (router: ReturnType<typeof useRouter>) => void;
  grupo: "Ações rápidas" | "Navegar" | "Resultados";
};

const acoesRapidas: Comando[] = [
  { id: "novo-cliente", titulo: "Novo cliente", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/clientes?novo=1") },
  { id: "nova-oportunidade", titulo: "Nova oportunidade", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/crm?novo=1") },
  { id: "nova-tarefa", titulo: "Nova tarefa", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/kanban?novo=1") },
  { id: "novo-evento", titulo: "Novo evento na agenda", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/agenda?novo=1") },
  { id: "nova-visita", titulo: "Registrar nova visita", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/visitas?novo=1") },
  { id: "novo-diagnostico", titulo: "Novo diagnóstico", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/diagnostico/novo") },
  { id: "novo-contrato", titulo: "Novo contrato", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/financeiro?novo=1") },
  { id: "nova-nota", titulo: "Emitir nota fiscal", icon: Plus, grupo: "Ações rápidas", onSelect: (r) => r.push("/faturamento?novo=1") },
];

const navegacao: Comando[] = [
  { id: "nav-dashboard", titulo: "Dashboard", icon: LayoutDashboard, grupo: "Navegar", onSelect: (r) => r.push("/dashboard") },
  { id: "nav-crm", titulo: "CRM", icon: Users2, grupo: "Navegar", onSelect: (r) => r.push("/crm") },
  { id: "nav-clientes", titulo: "Clientes", icon: Building2, grupo: "Navegar", onSelect: (r) => r.push("/clientes") },
  { id: "nav-kanban", titulo: "Kanban", icon: KanbanSquare, grupo: "Navegar", onSelect: (r) => r.push("/kanban") },
  { id: "nav-diagnostico", titulo: "Diagnóstico", icon: Stethoscope, grupo: "Navegar", onSelect: (r) => r.push("/diagnostico") },
  { id: "nav-agenda", titulo: "Agenda", icon: CalendarDays, grupo: "Navegar", onSelect: (r) => r.push("/agenda") },
  { id: "nav-visitas", titulo: "Visitas", icon: MapPin, grupo: "Navegar", onSelect: (r) => r.push("/visitas") },
  { id: "nav-plano", titulo: "Plano de Trabalho", icon: ClipboardList, grupo: "Navegar", onSelect: (r) => r.push("/plano-trabalho") },
  { id: "nav-arquivos", titulo: "Arquivos", icon: Folder, grupo: "Navegar", onSelect: (r) => r.push("/arquivos") },
  { id: "nav-financeiro", titulo: "Financeiro", icon: Wallet, grupo: "Navegar", onSelect: (r) => r.push("/financeiro") },
  { id: "nav-faturamento", titulo: "Faturamento", icon: Receipt, grupo: "Navegar", onSelect: (r) => r.push("/faturamento") },
  { id: "nav-relatorios", titulo: "Relatórios", icon: FileText, grupo: "Navegar", onSelect: (r) => r.push("/relatorios") },
  { id: "nav-automacoes", titulo: "Automações", icon: Zap, grupo: "Navegar", onSelect: (r) => r.push("/automacoes") },
  { id: "nav-configuracoes", titulo: "Configurações", icon: Settings, grupo: "Navegar", onSelect: (r) => r.push("/configuracoes") },
];

export default function CommandPalette() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Comando[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((v) => !v);
      }
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (aberto) {
      setQuery("");
      setIndiceAtivo(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setBuscando(true);
      const termo = `%${query}%`;

      const [clientes, oportunidades, tarefas, arquivos] = await Promise.all([
        supabase.from("clientes").select("id, nome_fantasia, razao_social").or(`nome_fantasia.ilike.${termo},razao_social.ilike.${termo}`).limit(4),
        supabase.from("leads_oportunidades").select("id, empresa_nome").ilike("empresa_nome", termo).limit(4),
        supabase.from("tarefas").select("id, titulo").ilike("titulo", termo).limit(4),
        supabase.from("arquivos").select("id, nome").ilike("nome", termo).limit(4),
      ]);

      const lista: Comando[] = [
        ...(clientes.data ?? []).map((c) => ({
          id: `cliente-${c.id}`, titulo: c.nome_fantasia ?? c.razao_social, subtitulo: "Cliente",
          icon: Building2, grupo: "Resultados" as const, onSelect: (r: ReturnType<typeof useRouter>) => r.push(`/clientes/${c.id}`),
        })),
        ...(oportunidades.data ?? []).map((o) => ({
          id: `op-${o.id}`, titulo: o.empresa_nome, subtitulo: "Oportunidade (CRM)",
          icon: Users2, grupo: "Resultados" as const, onSelect: (r: ReturnType<typeof useRouter>) => r.push(`/crm/${o.id}`),
        })),
        ...(tarefas.data ?? []).map((t) => ({
          id: `tarefa-${t.id}`, titulo: t.titulo, subtitulo: "Tarefa (Kanban)",
          icon: KanbanSquare, grupo: "Resultados" as const, onSelect: (r: ReturnType<typeof useRouter>) => r.push(`/kanban`),
        })),
        ...(arquivos.data ?? []).map((a) => ({
          id: `arquivo-${a.id}`, titulo: a.nome, subtitulo: "Arquivo",
          icon: Folder, grupo: "Resultados" as const, onSelect: (r: ReturnType<typeof useRouter>) => r.push(`/arquivos`),
        })),
      ];
      setResultados(lista);
      setBuscando(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const listaExibida: Comando[] =
    query.trim().length >= 2 ? resultados : [...acoesRapidas, ...navegacao];

  function selecionar(cmd: Comando) {
    cmd.onSelect(router);
    setAberto(false);
  }

  function onKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.min(i + 1, listaExibida.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && listaExibida[indiceAtivo]) {
      selecionar(listaExibida[indiceAtivo]);
    }
  }

  if (!aberto) return null;

  let grupoAnterior = "";

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[12vh] px-4" onClick={() => setAberto(false)}>
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#eef0f2]">
          <Search size={16} color="#9aa0ac" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndiceAtivo(0); }}
            onKeyDown={onKeyDownInput}
            placeholder="Buscar ou executar um comando..."
            className="flex-1 outline-none text-[14px] text-[#16181d] placeholder:text-[#9aa0ac]"
          />
          {buscando && <Loader2 size={14} className="animate-spin text-[#9aa0ac]" />}
          <kbd className="text-[10.5px] text-[#9aa0ac] bg-[#f5f6f8] px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-1.5">
          {listaExibida.length === 0 && (
            <div className="px-4 py-6 text-center text-[12.5px] text-[#9aa0ac]">Nenhum resultado encontrado.</div>
          )}
          {listaExibida.map((cmd, i) => {
            const Icon = cmd.icon;
            const mostrarCabecalho = cmd.grupo !== grupoAnterior;
            grupoAnterior = cmd.grupo;
            return (
              <div key={cmd.id}>
                {mostrarCabecalho && (
                  <div className="text-[10.5px] font-semibold text-[#9aa0ac] uppercase tracking-wide px-4 pt-2.5 pb-1">
                    {cmd.grupo}
                  </div>
                )}
                <button
                  onClick={() => selecionar(cmd)}
                  onMouseEnter={() => setIndiceAtivo(i)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-[#f5f6f8]"
                  style={i === indiceAtivo ? { background: "#eaf1fb" } : undefined}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center shrink-0">
                    <Icon size={13} color="#5b6270" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-[#16181d] truncate">{cmd.titulo}</div>
                    {cmd.subtitulo && <div className="text-[11px] text-[#9aa0ac]">{cmd.subtitulo}</div>}
                  </div>
                  {i === indiceAtivo && <CornerDownLeft size={12} className="text-[#9aa0ac] shrink-0" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#eef0f2] bg-[#fafbfc]">
          <span className="flex items-center gap-1 text-[10.5px] text-[#9aa0ac]">
            <kbd className="bg-white border border-[#e4e6ea] rounded px-1">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1 text-[10.5px] text-[#9aa0ac]">
            <kbd className="bg-white border border-[#e4e6ea] rounded px-1">Enter</kbd> selecionar
          </span>
        </div>
      </div>
    </div>
  );
}
