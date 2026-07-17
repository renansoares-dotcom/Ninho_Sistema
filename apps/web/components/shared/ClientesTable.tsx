"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { Avatar } from "./Avatar";
import { clientes } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  Ativo: "bg-[#eafaf1] text-[#0e9f6e]",
  Prospect: "bg-[#eaf1fb] text-primary",
  Inativo: "bg-[#f5f6f8] text-[#767c88]",
};

export default function ClientesTable() {
  const [query, setQuery] = useState("");

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(query.toLowerCase())
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

      <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eef0f2]">
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Empresa</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Segmento</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Faturamento</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Responsável</th>
              <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Última atividade</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">
                  <Link href={`/clientes/${c.id}`} className="hover:underline">
                    {c.nome}
                  </Link>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.segmento}</td>
                <td className="px-5 py-4">
                  <span
                    className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#5b6270]">{c.faturamento}</td>
                <td className="px-5 py-4">
                  <Avatar initials={c.resp} size={24} />
                </td>
                <td className="px-5 py-4 text-[12.5px] text-[#9aa0ac]">{c.ultimaAtividade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
