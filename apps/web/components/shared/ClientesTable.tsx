"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  Ativo: "bg-[#eafaf1] text-[#0e9f6e]",
  Prospect: "bg-[#eaf1fb] text-primary",
  Inativo: "bg-[#f5f6f8] text-[#767c88]",
};

type ClienteRow = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string;
  segmento: string | null;
  status: string | null;
  faturamento: number | null;
  updated_at: string;
};

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatarFaturamento(valor: number | null) {
  if (!valor) return "—";
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(1)} mi/ano`;
  return `R$ ${(valor / 1000).toFixed(0)} mil/ano`;
}

export default function ClientesTable() {
  const [query, setQuery] = useState("");
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome_fantasia, razao_social, segmento, status, faturamento, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        setErro(error.message);
      } else {
        setClientes(data ?? []);
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  const filtrados = clientes.filter((c) =>
    (c.nome_fantasia ?? c.razao_social).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center gap-1.5 bg-[#f5f6f8] rounded-lg px-3 py-2 w-[280px]">
          <Search size={14} color="#9aa0ac" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="bg-transparent outline-none text-[12.5px] text-[#3f434d] placeholder:text-[#9aa0ac] w-full"
          />
        </div>
        {["Status", "Segmento", "Responsável"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border border-[#e4e6ea] bg-white text-[#5b6270]"
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
      </div>

      {erro && (
        <div className="mb-4 text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">
          Não foi possível carregar os clientes: {erro}
        </div>
      )}

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        {carregando ? (
          <div className="flex items-center justify-center gap-2 py-14 text-[#9aa0ac] text-[13px]">
            <Loader2 size={16} className="animate-spin" />
            Carregando clientes do banco de dados...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eef0f2]">
                <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Empresa</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Segmento</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">
                    <Link href={`/clientes/${c.id}`} className="hover:underline flex items-center gap-2.5">
                      <Avatar initials={iniciais(c.nome_fantasia ?? c.razao_social)} size={24} />
                      {c.nome_fantasia ?? c.razao_social}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.segmento ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[c.status ?? "Ativo"]}`}>
                      {c.status ?? "Ativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#5b6270]">{formatarFaturamento(c.faturamento)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-[#9aa0ac]">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
