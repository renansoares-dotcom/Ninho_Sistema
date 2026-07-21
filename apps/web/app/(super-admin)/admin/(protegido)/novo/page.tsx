"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, Building2 } from "lucide-react";

export default function NovoEscritorioPage() {
  const router = useRouter();
  const [nomeEscritorio, setNomeEscritorio] = useState("");
  const [slug, setSlug] = useState("");
  const [nomeAdmin, setNomeAdmin] = useState("");
  const [emailAdmin, setEmailAdmin] = useState("");
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<{ slug: string } | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/super-admin/criar-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeEscritorio, slug, nomeAdmin, emailAdmin, senhaAdmin }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Não foi possível criar agora.");
      setEnviando(false);
      return;
    }

    setSucesso({ slug: data.slug });
    setEnviando(false);
  }

  if (sucesso) {
    return (
      <div className="max-w-[480px] mx-auto py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0e9f6e]/15 flex items-center justify-center mb-5">
          <CheckCircle2 size={24} className="text-[#1FAE7A]" />
        </div>
        <h1 className="text-[19px] font-semibold text-white">Escritório criado com sucesso</h1>
        <p className="text-[13.5px] text-white/50 mt-2 leading-relaxed">
          O admin já pode entrar em <strong className="text-white/80">/login</strong> com o e-mail e senha
          que você definiu. O link de Diagnóstico Público desse escritório é:
        </p>
        <code className="mt-3 text-[12.5px] text-[#4B93E8] bg-white/5 px-3 py-1.5 rounded-lg">
          /diagnostico-publico/{sucesso.slug}
        </code>
        <div className="flex items-center gap-3 mt-7">
          <button onClick={() => router.push("/admin")} className="px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-[#004AAD] text-white">
            Ver escritórios
          </button>
          <button
            onClick={() => {
              setSucesso(null);
              setNomeEscritorio("");
              setSlug("");
              setNomeAdmin("");
              setEmailAdmin("");
              setSenhaAdmin("");
            }}
            className="px-4 py-2.5 rounded-lg text-[13px] font-medium text-white/60 border border-white/10"
          >
            Criar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto">
      <Link href="/admin" className="flex items-center gap-1.5 text-[12.5px] text-white/40 hover:text-white/70 mb-6 w-fit">
        <ArrowLeft size={13} /> Voltar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#004AAD]/20 flex items-center justify-center">
          <Building2 size={19} className="text-[#4B93E8]" />
        </div>
        <div>
          <h1 className="text-[18px] font-semibold text-white">Novo escritório</h1>
          <p className="text-[12.5px] text-white/45">Cria o tenant, os dados padrão e o primeiro acesso Admin</p>
        </div>
      </div>

      <form onSubmit={criar} className="bg-[#14171d] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        {erro && <div className="text-[12.5px] text-[#f04438] bg-[#f04438]/10 rounded-lg px-3.5 py-2.5">{erro}</div>}

        <div>
          <label className="text-[11.5px] text-white/40 mb-1 block">Nome do escritório</label>
          <input
            value={nomeEscritorio}
            onChange={(e) => setNomeEscritorio(e.target.value)}
            required
            placeholder="Ex: Alvorada Consultoria"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
        </div>

        <div>
          <label className="text-[11.5px] text-white/40 mb-1 block">Endereço do link público (slug)</label>
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] text-white/30 shrink-0">/diagnostico-publico/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="alvorada (opcional, gera do nome se vazio)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
            />
          </div>
        </div>

        <div className="h-px bg-white/10 my-1" />

        <div>
          <label className="text-[11.5px] text-white/40 mb-1 block">Nome do primeiro Admin</label>
          <input
            value={nomeAdmin}
            onChange={(e) => setNomeAdmin(e.target.value)}
            required
            placeholder="Nome completo"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
        </div>
        <div>
          <label className="text-[11.5px] text-white/40 mb-1 block">E-mail do Admin</label>
          <input
            type="email"
            value={emailAdmin}
            onChange={(e) => setEmailAdmin(e.target.value)}
            required
            placeholder="admin@escritorio.com"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
        </div>
        <div>
          <label className="text-[11.5px] text-white/40 mb-1 block">Senha inicial</label>
          <input
            type="text"
            value={senhaAdmin}
            onChange={(e) => setSenhaAdmin(e.target.value)}
            required
            minLength={8}
            placeholder="Pelo menos 8 caracteres — repasse pro cliente"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/25 outline-none focus:border-[#4B93E8]"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[13.5px] font-semibold bg-[#004AAD] text-white hover:bg-[#0057C7] transition-colors disabled:opacity-60 mt-2"
        >
          {enviando ? <Loader2 size={15} className="animate-spin" /> : <Building2 size={15} />}
          {enviando ? "Criando..." : "Criar escritório"}
        </button>
      </form>
    </div>
  );
}
