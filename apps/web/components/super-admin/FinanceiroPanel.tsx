"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Assinatura = {
  id: string;
  tenant_id: string;
  plano: string;
  valor_mensal: number;
  status_pagamento: string;
  proximo_vencimento: string | null;
  observacoes: string | null;
  tenants: { nome: string } | null;
};

const statusCores: Record<string, string> = {
  "Em dia": "bg-[#0e9f6e]/15 text-[#1FAE7A]",
  Atrasado: "bg-[#f04438]/15 text-[#f04438]",
  Cancelado: "bg-white/10 text-white/50",
  Trial: "bg-[#4B93E8]/15 text-[#4B93E8]",
};

export default function FinanceiroPanel() {
  const searchParams = useSearchParams();
  const tenantFiltro = searchParams.get("tenant");

  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("tenant_assinaturas")
      .select("id, tenant_id, plano, valor_mensal, status_pagamento, proximo_vencimento, observacoes, tenants(nome)")
      .order("updated_at", { ascending: false });
    setAssinaturas((data as any) ?? []);
    setCarregando(false);
  }

  async function salvarCampo(id: string, campo: string, valor: string | number) {
    setAssinaturas((prev) => prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
    setSalvandoId(id);
    await supabase.from("tenant_assinaturas").update({ [campo]: valor, updated_at: new Date().toISOString() }).eq("id", id);
    setSalvandoId(null);
  }

  const lista = tenantFiltro ? assinaturas.filter((a) => a.tenant_id === tenantFiltro) : assinaturas;
  const receitaTotal = assinaturas
    .filter((a) => a.status_pagamento === "Em dia")
    .reduce((s, a) => s + Number(a.valor_mensal || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Financeiro</h1>
          <p className="text-[13px] text-white/45 mt-0.5">
            Receita mensal recorrente (MRR) em dia:{" "}
            <strong className="text-[#1FAE7A]">
              {receitaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
          </p>
        </div>
        {tenantFiltro && (
          <Link href="/admin/financeiro" className="flex items-center gap-1.5 text-[12.5px] text-white/50 hover:text-white">
            <X size={13} /> Limpar filtro
          </Link>
        )}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-16 text-white/40 text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="bg-[#14171d] border border-white/10 rounded-2xl divide-y divide-white/5">
          {lista.map((a) => (
            <div key={a.id} className="p-4 flex items-center gap-3 flex-wrap">
              <div className="w-[160px] shrink-0">
                <div className="text-[13.5px] font-semibold text-white truncate">{a.tenants?.nome}</div>
                <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-1 ${statusCores[a.status_pagamento] ?? ""}`}>
                  {a.status_pagamento}
                </span>
              </div>

              <input
                defaultValue={a.plano}
                onBlur={(e) => e.target.value !== a.plano && salvarCampo(a.id, "plano", e.target.value)}
                placeholder="Plano"
                className="w-[110px] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#4B93E8]"
              />

              <div className="flex items-center gap-1">
                <span className="text-[12px] text-white/40">R$</span>
                <input
                  type="number"
                  defaultValue={a.valor_mensal}
                  onBlur={(e) => salvarCampo(a.id, "valor_mensal", Number(e.target.value))}
                  className="w-[90px] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#4B93E8]"
                />
              </div>

              <select
                value={a.status_pagamento}
                onChange={(e) => salvarCampo(a.id, "status_pagamento", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#4B93E8]"
              >
                {Object.keys(statusCores).map((s) => (
                  <option key={s} value={s} className="bg-[#14171d]">{s}</option>
                ))}
              </select>

              <input
                type="date"
                defaultValue={a.proximo_vencimento ?? ""}
                onBlur={(e) => salvarCampo(a.id, "proximo_vencimento", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#4B93E8]"
              />

              <input
                defaultValue={a.observacoes ?? ""}
                onBlur={(e) => e.target.value !== a.observacoes && salvarCampo(a.id, "observacoes", e.target.value)}
                placeholder="Observações"
                className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
              />

              {salvandoId === a.id && <Loader2 size={13} className="animate-spin text-white/40" />}
            </div>
          ))}
          {lista.length === 0 && <div className="py-10 text-center text-[13px] text-white/40">Nenhum registro encontrado.</div>}
        </div>
      )}
    </div>
  );
}
