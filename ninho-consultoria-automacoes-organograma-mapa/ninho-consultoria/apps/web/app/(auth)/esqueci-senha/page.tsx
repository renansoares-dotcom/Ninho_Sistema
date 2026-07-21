"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { solicitarRedefinicaoSenha } from "@/lib/auth/actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm hover:brightness-110 transition disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Enviando..." : "Enviar link de redefinição"}
    </button>
  );
}

export default function EsqueciSenhaPage() {
  const [estado, formAction] = useFormState(solicitarRedefinicaoSenha, undefined);

  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl shadow-sm p-8">
      <Link href="/login" className="flex items-center gap-1.5 text-[12.5px] text-[#767c88] hover:text-primary mb-5 w-fit">
        <ArrowLeft size={14} /> Voltar para o login
      </Link>

      <h1 className="text-[19px] font-semibold text-[#16181d]">Esqueci minha senha</h1>
      <p className="text-[13px] text-[#767c88] mt-1 mb-6">
        Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
      </p>

      {estado?.enviado ? (
        <div className="flex items-start gap-2.5 text-[13px] text-[#0e9f6e] bg-[#eafaf1] rounded-lg px-3.5 py-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>Se esse e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.</span>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {estado?.erro && (
            <div className="text-[12.5px] text-[#f04438] bg-[#fdecea] rounded-lg px-3.5 py-2.5">
              {estado.erro}
            </div>
          )}
          <div>
            <label className="text-[12px] text-[#9aa0ac] mb-1 block">E-mail</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0ac]" />
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="voce@suaempresa.com"
                className="w-full border border-[#e4e6ea] rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <Botao />
        </form>
      )}
    </div>
  );
}
