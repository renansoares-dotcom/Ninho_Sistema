"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Lock } from "lucide-react";
import { redefinirSenha } from "@/lib/auth/actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm hover:brightness-110 transition disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Salvando..." : "Salvar nova senha"}
    </button>
  );
}

export default function RedefinirSenhaPage() {
  const [estado, formAction] = useFormState(redefinirSenha, undefined);

  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl shadow-sm p-8">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Criar nova senha</h1>
      <p className="text-[13px] text-[#767c88] mt-1 mb-6">
        Escolha uma nova senha para sua conta. Use pelo menos 8 caracteres.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        {estado?.erro && (
          <div className="text-[12.5px] text-[#f04438] bg-[#fdecea] rounded-lg px-3.5 py-2.5">
            {estado.erro}
          </div>
        )}
        <div>
          <label className="text-[12px] text-[#9aa0ac] mb-1 block">Nova senha</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0ac]" />
            <input
              type="password"
              name="senha"
              required
              autoFocus
              minLength={8}
              placeholder="••••••••"
              className="w-full border border-[#e4e6ea] rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-[12px] text-[#9aa0ac] mb-1 block">Confirmar nova senha</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0ac]" />
            <input
              type="password"
              name="confirmacao"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full border border-[#e4e6ea] rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <Botao />
      </form>
    </div>
  );
}
