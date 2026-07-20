"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Building2, Users2, KanbanSquare, Stethoscope, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Resultado = {
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
  tipo: "cliente" | "oportunidade" | "tarefa" | "diagnostico";
};

const iconePorTipo = {
  cliente: Building2,
  oportunidade: Users2,
  tarefa: KanbanSquare,
  diagnostico: Stethoscope,
};

const labelPorTipo = {
  cliente: "Clientes",
  oportunidade: "CRM",
  tarefa: "Kanban",
  diagnostico: "Diagnóstico",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setBuscando(true);
      const termo = `%${query}%`;

      const [clientes, oportunidades, tarefas, diagnosticos] = await Promise.all([
        supabase.from("clientes").select("id, nome_fantasia, razao_social, segmento").or(`nome_fantasia.ilike.${termo},razao_social.ilike.${termo}`).limit(4),
        supabase.from("leads_oportunidades").select("id, empresa_nome, etapa").ilike("empresa_nome", termo).limit(4),
        supabase.from("tarefas").select("id, titulo, coluna").ilike("titulo", termo).limit(4),
        supabase.from("diagnosticos").select("id, status, clientes(nome_fantasia, razao_social)").limit(20),
      ]);

      const lista: Resultado[] = [
        ...(clientes.data ?? []).map((c) => ({
          id: c.id,
          titulo: c.nome_fantasia ?? c.razao_social,
          subtitulo: c.segmento ?? "Cliente",
          href: `/clientes/${c.id}`,
          tipo: "cliente" as const,
        })),
        ...(oportunidades.data ?? []).map((o) => ({
          id: o.id,
          titulo: o.empresa_nome,
          subtitulo: `Etapa: ${o.etapa}`,
          href: `/crm/${o.id}`,
          tipo: "oportunidade" as const,
        })),
        ...(tarefas.data ?? []).map((t) => ({
          id: t.id,
          titulo: t.titulo,
          subtitulo: `Kanban · ${t.coluna}`,
          href: `/kanban`,
          tipo: "tarefa" as const,
        })),
        ...(diagnosticos.data ?? [])
          .filter((d: any) => {
            const nome = d.clientes?.nome_fantasia ?? d.clientes?.razao_social ?? "";
            return nome.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 4)
          .map((d: any) => ({
            id: d.id,
            titulo: d.clientes?.nome_fantasia ?? d.clientes?.razao_social ?? "Diagnóstico",
            subtitulo: `Diagnóstico · ${d.status}`,
            href: `/diagnostico/${d.id}`,
            tipo: "diagnostico" as const,
          })),
      ];

      setResultados(lista);
      setBuscando(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-2.5 py-1.5 w-[200px]">
        <Search size={14} color="#9aa0ac" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setAberto(true)}
          placeholder="Pesquisar..."
          className="bg-transparent outline-none text-[12.5px] text-[#3f434d] placeholder:text-[#9aa0ac] w-full"
        />
        <kbd className="text-[10px] text-[#b0b4bb] bg-white border border-[#e4e6ea] rounded px-1 shrink-0">⌘K</kbd>
      </div>

      {aberto && query.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-[#eef0f2] rounded-xl shadow-lg py-2 w-[320px] max-h-[400px] overflow-y-auto z-30">
          {buscando ? (
            <div className="flex items-center gap-2 px-4 py-3 text-[#9aa0ac] text-[12.5px]">
              <Loader2 size={13} className="animate-spin" />
              Buscando...
            </div>
          ) : resultados.length === 0 ? (
            <div className="px-4 py-3 text-[12.5px] text-[#9aa0ac]">Nenhum resultado para &quot;{query}&quot;.</div>
          ) : (
            resultados.map((r) => {
              const Icon = iconePorTipo[r.tipo];
              return (
                <Link
                  key={`${r.tipo}-${r.id}`}
                  href={r.href}
                  onClick={() => setAberto(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f5f6f8]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#eaf1fb] flex items-center justify-center shrink-0">
                    <Icon size={13} color="#004AAD" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-[#16181d] truncate">{r.titulo}</div>
                    <div className="text-[11px] text-[#9aa0ac] truncate">{labelPorTipo[r.tipo]} · {r.subtitulo}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
