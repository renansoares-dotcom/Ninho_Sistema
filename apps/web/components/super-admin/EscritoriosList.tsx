"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Building2, Users2, Briefcase, Power } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Tenant = {
  id: string;
  nome: string;
  slug: string | null;
  ativo: boolean;
  created_at: string;
  usuarios: number;
  clientes: number;
};

export default function EscritoriosList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [alterandoId, setAlterandoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data: listaTenants } = await supabase
      .from("tenants")
      .select("id, nome, slug, ativo, created_at")
      .order("created_at", { ascending: false });

    const comContagem = await Promise.all(
      (listaTenants ?? []).map(async (t) => {
        const [{ count: usuarios }, { count: clientes }] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("tenant_id", t.id),
          supabase.from("clientes").select("id", { count: "exact", head: true }).eq("tenant_id", t.id),
        ]);
        return { ...t, usuarios: usuarios ?? 0, clientes: clientes ?? 0 };
      })
    );

    setTenants(comContagem);
    setCarregando(false);
  }

  async function alternarAtivo(t: Tenant) {
    const acao = t.ativo ? "suspender" : "reativar";
    if (!confirm(`Tem certeza que deseja ${acao} o acesso de "${t.nome}"? ${t.ativo ? "Ninguém desse escritório vai conseguir logar." : ""}`)) return;

    setAlterandoId(t.id);
    await supabase.from("tenants").update({ ativo: !t.ativo }).eq("id", t.id);
    setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, ativo: !x.ativo } : x)));
    setAlterandoId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Escritórios</h1>
          <p className="text-[13px] text-white/45 mt-0.5">{tenants.length} cadastrados na plataforma</p>
        </div>
        <Link
          href="/admin/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-[#004AAD] text-white hover:bg-[#0057C7] transition-colors"
        >
          <Plus size={15} /> Novo escritório
        </Link>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-16 text-white/40 text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : tenants.length === 0 ? (
        <div className="py-16 text-center text-[13.5px] text-white/40">Nenhum escritório cadastrado ainda.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {tenants.map((t) => (
            <div key={t.id} className="bg-[#14171d] border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004AAD]/20 flex items-center justify-center shrink-0">
                    <Building2 size={17} className="text-[#4B93E8]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-white">{t.nome}</div>
                    <div className="text-[11.5px] text-white/40">/{t.slug || "sem-slug"}</div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    t.ativo ? "bg-[#0e9f6e]/15 text-[#1FAE7A]" : "bg-[#f04438]/15 text-[#f04438]"
                  }`}
                >
                  {t.ativo ? "Ativo" : "Suspenso"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[12px] text-white/50 mb-4">
                <span className="flex items-center gap-1.5"><Users2 size={12} /> {t.usuarios} usuários</span>
                <span className="flex items-center gap-1.5"><Briefcase size={12} /> {t.clientes} clientes</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/financeiro?tenant=${t.id}`}
                  className="flex-1 text-center py-2 rounded-lg text-[12px] font-medium border border-white/10 text-white/70 hover:bg-white/5"
                >
                  Financeiro
                </Link>
                <button
                  onClick={() => alternarAtivo(t)}
                  disabled={alterandoId === t.id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium disabled:opacity-50 ${
                    t.ativo ? "border border-[#f04438]/30 text-[#f04438] hover:bg-[#f04438]/10" : "border border-[#0e9f6e]/30 text-[#1FAE7A] hover:bg-[#0e9f6e]/10"
                  }`}
                >
                  {alterandoId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                  {t.ativo ? "Suspender" : "Reativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
