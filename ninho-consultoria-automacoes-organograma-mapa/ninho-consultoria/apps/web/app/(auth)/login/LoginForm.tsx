"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { entrar } from "@/lib/auth/actions";

function BotaoEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm hover:brightness-110 transition disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function LoginForm() {
  const [estado, formAction] = useFormState(entrar, undefined);
  const searchParams = useSearchParams();
  const proximo = searchParams.get("proximo") || "/dashboard";
  const linkInvalido = searchParams.get("erro") === "link_invalido";
  const semPerfil = searchParams.get("erro") === "sem_perfil";
  const inativo = searchParams.get("erro") === "inativo";

  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl shadow-sm p-8">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Entrar</h1>
      <p className="text-[13px] text-[#767c88] mt-1 mb-6">
        Acesse sua conta na plataforma Ninho Consultoria.
      </p>

      {linkInvalido && (
        <div className="text-[12.5px] text-[#e08a00] bg-[#fff7e6] rounded-lg px-3.5 py-2.5 mb-4">
          Esse link expirou ou já foi usado. Solicite um novo se precisar redefinir sua senha.
        </div>
      )}

      {semPerfil && (
        <div className="text-[12.5px] text-[#e08a00] bg-[#fff7e6] rounded-lg px-3.5 py-2.5 mb-4">
          Sua conta ainda não tem um perfil configurado na plataforma. Fale com um administrador.
        </div>
      )}

      {inativo && (
        <div className="text-[12.5px] text-[#e08a00] bg-[#fff7e6] rounded-lg px-3.5 py-2.5 mb-4">
          Seu acesso está desativado. Fale com um administrador da consultoria.
        </div>
      )}

      {estado?.erro && (
        <div className="text-[12.5px] text-[#f04438] bg-[#fdecea] rounded-lg px-3.5 py-2.5 mb-4">
          {estado.erro}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="proximo" value={proximo} />

        <div>
          <label className="text-[12px] text-[#9aa0ac] mb-1 block">E-mail</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0ac]" />
            <input
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="voce@suaempresa.com"
              className="w-full border border-[#e4e6ea] rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] text-[#9aa0ac]">Senha</label>
            <Link href="/esqueci-senha" className="text-[12px] text-primary font-medium hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0ac]" />
            <input
              type="password"
              name="senha"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-[#e4e6ea] rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <BotaoEntrar />
      </form>

      <p className="text-[12px] text-[#9aa0ac] mt-6 text-center">
        Sua conta é criada por um administrador da consultoria. Se ainda não recebeu um acesso, fale com quem administra o sistema na sua empresa.
      </p>
    </div>
  );
}
