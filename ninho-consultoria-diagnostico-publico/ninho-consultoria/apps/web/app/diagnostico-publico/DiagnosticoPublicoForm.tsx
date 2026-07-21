"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

type Pergunta = { id: string; texto: string; peso: number };

function corPorFaixa(v: number) {
  if (v >= 8) return "#0e9f6e";
  if (v >= 5) return "#f59e0b";
  return "#f04438";
}
function labelPorFaixa(v: number) {
  if (v >= 8) return "Maturidade avançada";
  if (v >= 5) return "Em desenvolvimento";
  return "Estágio inicial";
}

export default function DiagnosticoPublicoForm() {
  const [carregando, setCarregando] = useState(true);
  const [empresa, setEmpresa] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [etapa, setEtapa] = useState<"contato" | "perguntas" | "resultado" | "erro">("contato");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<{ nota: number; mensagem: string } | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/diagnostico-publico");
        const data = await res.json();
        if (!res.ok) throw new Error();
        setEmpresa(data.empresa);
        setPerguntas(data.perguntas);
        setRespostas(Object.fromEntries(data.perguntas.map((p: Pergunta) => [p.id, 5])));
      } catch {
        setEtapa("erro");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function enviarContato(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    setEtapa("perguntas");
  }

  async function enviarRespostas() {
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/diagnostico-publico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          celular,
          empresa_honeypot: honeypot,
          respostas: perguntas.map((p) => ({ id: p.id, resposta: respostas[p.id] ?? 5 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível enviar agora.");
        setEnviando(false);
        return;
      }
      setResultado({ nota: data.nota, mensagem: data.mensagem });
      setEtapa("resultado");
    } catch {
      setErro("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
    }
    setEnviando(false);
  }

  if (carregando) {
    return <Loader2 size={22} className="animate-spin text-primary mt-24" />;
  }

  if (etapa === "erro") {
    return (
      <div className="text-center text-[13.5px] text-[#767c88] mt-24 max-w-[360px]">
        Não foi possível carregar o diagnóstico agora. Tente novamente em instantes.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center">
      <Image src="/logo.png" alt="Ninho Consultoria" width={150} height={60} className="h-11 w-auto mb-8" priority />

      <div className="w-full bg-white border border-[#eef0f2] rounded-2xl shadow-sm p-8">
        {etapa === "contato" && (
          <>
            <div className="text-[11.5px] font-semibold text-primary uppercase tracking-wide mb-2">
              Diagnóstico gratuito
            </div>
            <h1 className="text-[20px] font-semibold text-[#16181d] leading-snug">
              Descubra o estágio de maturidade do seu negócio
            </h1>
            <p className="text-[13px] text-[#767c88] mt-2 mb-6">
              {perguntas.length} perguntas rápidas, menos de 3 minutos, feito por {empresa}.
            </p>

            <form onSubmit={enviarContato} className="flex flex-col gap-3.5">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Nome completo"
                className="w-full border border-[#e4e6ea] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mail"
                className="w-full border border-[#e4e6ea] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
              <input
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Celular (com DDD)"
                className="w-full border border-[#e4e6ea] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary"
              />
              {/* Honeypot — invisível pra pessoas, só bots preenchem */}
              <input
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none w-0 h-0"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm hover:brightness-110 transition mt-1"
              >
                Acessar meu diagnóstico
                <ArrowRight size={15} />
              </button>
            </form>
          </>
        )}

        {etapa === "perguntas" && (
          <>
            <h1 className="text-[17px] font-semibold text-[#16181d] mb-1">Responda com sinceridade</h1>
            <p className="text-[12.5px] text-[#9aa0ac] mb-6">0 = não existe / não fazemos · 10 = totalmente estruturado</p>

            <div className="flex flex-col gap-5">
              {perguntas.map((p) => (
                <div key={p.id}>
                  <div className="text-[13.5px] font-medium text-[#16181d] mb-2">{p.texto}</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={respostas[p.id] ?? 5}
                      onChange={(e) => setRespostas((r) => ({ ...r, [p.id]: Number(e.target.value) }))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-[13px] font-semibold text-primary w-6 text-right">{respostas[p.id] ?? 5}</span>
                  </div>
                </div>
              ))}
            </div>

            {erro && <div className="text-[12.5px] text-[#f04438] bg-[#fdecea] rounded-lg px-3.5 py-2.5 mt-5">{erro}</div>}

            <button
              onClick={enviarRespostas}
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm hover:brightness-110 transition mt-6 disabled:opacity-60"
            >
              {enviando ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {enviando ? "Enviando..." : "Ver meu resultado"}
            </button>
          </>
        )}

        {etapa === "resultado" && resultado && (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="rounded-full w-[110px] h-[110px] flex items-center justify-center mb-5"
              style={{ background: `conic-gradient(${corPorFaixa(resultado.nota)} ${resultado.nota * 36}deg, #f0f1f3 0deg)` }}
            >
              <div className="bg-white rounded-full w-[86px] h-[86px] flex items-center justify-center">
                <span className="text-[26px] font-bold" style={{ color: corPorFaixa(resultado.nota) }}>
                  {resultado.nota.toFixed(1)}
                </span>
              </div>
            </div>
            <span
              className="text-[12px] font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{ background: `${corPorFaixa(resultado.nota)}1a`, color: corPorFaixa(resultado.nota) }}
            >
              {labelPorFaixa(resultado.nota)}
            </span>
            <h1 className="text-[18px] font-semibold text-[#16181d]">Diagnóstico recebido, {nome.split(" ")[0]}!</h1>
            <p className="text-[13.5px] text-[#767c88] mt-2 max-w-[340px]">
              Essa é uma visão rápida do estágio atual do seu negócio. Nossa equipe vai analisar suas respostas
              com calma e entrar em contato para te mostrar o que isso significa na prática.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
