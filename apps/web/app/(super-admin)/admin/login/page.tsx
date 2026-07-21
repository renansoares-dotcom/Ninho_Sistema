"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { entrarSuperAdmin } from "@/lib/auth/actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[13.5px] font-semibold bg-[#004AAD] text-white hover:bg-[#0057C7] transition-colors disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function SuperAdminLoginPage() {
  const [estado, formAction] = useFormState(entrarSuperAdmin, undefined);

  return (
    <div className="min-h-screen bg-[#0d0f13] flex flex-col items-center justify-center px-4">
      <div className="w-11 h-11 rounded-2xl bg-[#004AAD]/20 flex items-center justify-center mb-6">
        <ShieldCheck size={20} className="text-[#4B93E8]" />
      </div>

      <div className="w-full max-w-[380px]">
        <h1 className="text-[19px] font-semibold text-white text-center">Acesso restrito</h1>
        <p className="text-[13px] text-white/40 text-center mt-1.5 mb-7">
          Painel de administração da plataforma. Login exclusivo, separado do acesso de qualquer escritório.
        </p>

        {estado?.erro && (
          <div className="text-[12.5px] text-[#f04438] bg-[#f04438]/10 rounded-lg px-3.5 py-2.5 mb-4">{estado.erro}</div>
        )}

        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            autoFocus
            placeholder="E-mail"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
          <input
            type="password"
            name="senha"
            required
            placeholder="Senha"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
          <div className="mt-1.5">
            <Botao />
          </div>
        </form>
      </div>
    </div>
  );
}
