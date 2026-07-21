"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  tenants: { nome: string } | null;
};

export default function UsuariosGlobalPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [query, setQuery] = useState("");
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, role, ativo, tenants(nome)")
      .order("nome");
    setUsuarios((data as any) ?? []);
    setCarregando(false);
  }

  async function alternarAtivo(u: Usuario) {
    if (!confirm(`${u.ativo ? "Bloquear" : "Reativar"} o acesso de "${u.nome}"?`)) return;
    setSalvandoId(u.id);
    await supabase.from("profiles").update({ ativo: !u.ativo }).eq("id", u.id);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: !x.ativo } : x)));
    setSalvandoId(null);
  }

  const filtrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.tenants?.nome ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Usuários</h1>
          <p className="text-[13px] text-white/45 mt-0.5">Todos os acessos, de todos os escritórios, num só lugar</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-[260px]">
          <Search size={13} className="text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nome, e-mail ou escritório..."
            className="bg-transparent outline-none text-[12.5px] text-white placeholder:text-white/30 w-full"
          />
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-16 text-white/40 text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="bg-[#14171d] border border-white/10 rounded-2xl divide-y divide-white/5">
          {filtrados.map((u) => (
            <div key={u.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-white truncate">{u.nome}</div>
                <div className="text-[12px] text-white/40 truncate">{u.email}</div>
              </div>
              <span className="text-[11.5px] text-white/50 w-[140px] truncate">{u.tenants?.nome ?? "—"}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60 w-[90px] text-center">
                {u.role}
              </span>
              <button
                onClick={() => alternarAtivo(u)}
                disabled={salvandoId === u.id}
                className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium disabled:opacity-50 w-[80px] ${
                  u.ativo ? "bg-[#0e9f6e]/15 text-[#1FAE7A]" : "bg-[#f04438]/15 text-[#f04438]"
                }`}
              >
                {u.ativo ? "Ativo" : "Bloqueado"}
              </button>
            </div>
          ))}
          {filtrados.length === 0 && <div className="py-10 text-center text-[13px] text-white/40">Nenhum usuário encontrado.</div>}
        </div>
      )}
    </div>
  );
}
