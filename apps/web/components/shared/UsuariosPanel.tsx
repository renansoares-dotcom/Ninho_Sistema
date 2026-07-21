"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import Card from "./Card";
import { Avatar } from "./Avatar";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";
import { ROLE_LABELS, ROLES_GESTAO, type UserRole } from "@/lib/auth/permissions";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
};

const ROLES_SELECIONAVEIS: UserRole[] = ["admin", "diretor", "coordenador", "consultor", "financeiro", "cliente"];

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function UsuariosPanel() {
  const profile = useProfile();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, nome, email, role, ativo")
        .order("nome");
      setUsuarios((data as Usuario[]) || []);
      setCarregando(false);
    }
    carregar();
  }, []);

  // Apenas Administrador e Diretor gerenciam usuários. RLS no banco garante
  // isso de verdade; aqui é só para não exibir a tela pra quem não pode usar.
  if (!ROLES_GESTAO.includes(profile.role)) {
    return null;
  }

  async function alterarRole(id: string, role: UserRole) {
    setSalvandoId(id);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    await supabase.from("profiles").update({ role }).eq("id", id);
    setSalvandoId(null);
  }

  async function alterarAtivo(id: string, ativo: boolean) {
    setSalvandoId(id);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo } : u)));
    await supabase.from("profiles").update({ ativo }).eq("id", id);
    setSalvandoId(null);
  }

  return (
    <Card title="Usuários e permissões">
      <div className="flex items-start gap-2 text-[12.5px] text-[#767c88] bg-[#f7f8fa] rounded-lg px-3.5 py-2.5 mb-4">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Novas contas são criadas pelo Supabase Auth (painel do projeto). Assim que alguém faz o
          primeiro login, ela aparece aqui — defina o perfil de acesso correto.
        </span>
      </div>

      {carregando ? (
        <div className="flex items-center gap-2 text-[13px] text-[#9aa0ac] py-6 justify-center">
          <Loader2 size={16} className="animate-spin" /> Carregando usuários...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-[13px] text-[#9aa0ac] py-6 text-center">Nenhum usuário encontrado ainda.</div>
      ) : (
        <div className="flex flex-col divide-y divide-[#f2f3f5]">
          {usuarios.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar initials={iniciais(u.nome)} size={32} />
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#16181d] truncate">{u.nome}</div>
                  <div className="text-[12px] text-[#9aa0ac] truncate">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={u.role}
                  disabled={salvandoId === u.id || u.id === profile.id}
                  onChange={(e) => alterarRole(u.id, e.target.value as UserRole)}
                  className="border border-[#e4e6ea] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#16181d] outline-none focus:border-primary disabled:opacity-60"
                >
                  {ROLES_SELECIONAVEIS.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <button
                  disabled={salvandoId === u.id || u.id === profile.id}
                  onClick={() => alterarAtivo(u.id, !u.ativo)}
                  className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium disabled:opacity-60 ${
                    u.ativo ? "bg-[#eafaf1] text-[#0e9f6e]" : "bg-[#fdecea] text-[#f04438]"
                  }`}
                >
                  {u.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
