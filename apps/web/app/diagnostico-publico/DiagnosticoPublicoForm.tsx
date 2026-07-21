"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Pergunta = { id: string; texto: string; peso: number };
type Etapa = "contato" | "pergunta" | "enviando" | "resultado" | "erro";

function faixa(nota: number) {
  if (nota >= 8) return { cor: "#1FAE7A", label: "Maturidade avançada", texto: "Sua empresa já opera com processos estruturados na maior parte das frentes avaliadas." };
  if (nota >= 5) return { cor: "#E0A100", label: "Em desenvolvimento", texto: "Existem bases importantes construídas, mas ainda há espaço real para estruturar melhor a operação." };
  return { cor: "#E0554F", label: "Estágio inicial", texto: "A empresa ainda depende muito de esforço individual — é exatamente o momento em que estruturar traz mais retorno." };
}

function Marca({ empresa, logoUrl, tamanho = "normal" }: { empresa: string; logoUrl: string | null; tamanho?: "normal" | "pequeno" }) {
  if (logoUrl) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-white ${
          tamanho === "pequeno" ? "px-2.5 py-1.5" : "px-4 py-3"
        } shadow-[0_4px_20px_rgba(0,0,0,0.18)]`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={empresa || "Logo"}
          className={tamanho === "pequeno" ? "h-5 w-auto max-w-[110px] object-contain" : "h-8 w-auto max-w-[160px] object-contain"}
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#4B93E8]" />
      <span className="text-[12px] tracking-[0.18em] uppercase font-medium text-white/50">
        {empresa || "Consultoria"}
      </span>
    </div>
  );
}

export default function DiagnosticoPublicoForm({ slug }: { slug?: string } = {}) {
  const urlBase = slug ? `/api/diagnostico-publico/${slug}` : "/api/diagnostico-publico";
  const [etapa, setEtapa] = useState<Etapa>("contato");
  const [empresa, setEmpresa] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [direcao, setDirecao] = useState(1);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ nota: number; mensagem: string } | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(urlBase);
        const data = await res.json();
        if (!res.ok) throw new Error();
        setEmpresa(data.empresa);
        setLogoUrl(data.logoUrl ?? null);
        setPerguntas(data.perguntas);
        setRespostas(Object.fromEntries(data.perguntas.map((p: Pergunta) => [p.id, 5])));
      } catch {
        setEtapa("erro");
      }
    }
    carregar();
  }, []);

  const perguntaAtual = perguntas[indice];
  const progresso = perguntas.length > 0 ? ((indice + 1) / perguntas.length) * 100 : 0;

  function avancarContato(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    setDirecao(1);
    setEtapa("pergunta");
  }

  function proxima() {
    if (indice < perguntas.length - 1) {
      setDirecao(1);
      setIndice((i) => i + 1);
    } else {
      enviar();
    }
  }

  function anterior() {
    if (indice > 0) {
      setDirecao(-1);
      setIndice((i) => i - 1);
    } else {
      setEtapa("contato");
    }
  }

  async function enviar() {
    setEtapa("enviando");
    setErroMsg(null);
    try {
      const res = await fetch(urlBase, {
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
        setErroMsg(data.error || "Não foi possível enviar agora.");
        setEtapa("pergunta");
        return;
      }
      setResultado({ nota: data.nota, mensagem: data.mensagem });
      setEtapa("resultado");
    } catch {
      setErroMsg("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
      setEtapa("pergunta");
    }
  }

  const variantes = {
    entra: (d: number) => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
    centro: { opacity: 1, x: 0 },
    sai: (d: number) => ({ opacity: 0, x: d > 0 ? -24 : 24 }),
  };

  if (etapa === "erro") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101319] text-white/70 text-[13.5px] px-6 text-center">
        Não foi possível carregar o diagnóstico agora. Tente novamente em instantes.
      </div>
    );
  }

  // ---------- ETAPA 1: CONTATO (hero escuro) ----------
  if (etapa === "contato") {
    return (
      <div className="min-h-screen bg-[#101319] relative overflow-hidden flex items-center justify-center px-6 py-16">
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,74,173,0.35), transparent 60%)" }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(ellipse 60% 40% at 85% 90%, rgba(2,115,188,0.25), transparent 65%)" }}
        />
        <div className="absolute inset-0 textura-diagnostico opacity-[0.15]" />

        <motion.div
          initial="oculto"
          animate="visivel"
          variants={{ visivel: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
          className="relative w-full max-w-[460px]"
        >
          <motion.div
            variants={{ oculto: { opacity: 0, y: 10 }, visivel: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <Marca empresa={empresa} logoUrl={logoUrl} />
          </motion.div>

          <motion.div
            variants={{ oculto: { opacity: 0, y: 10 }, visivel: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11.5px] tracking-[0.14em] text-[#4B93E8] uppercase font-semibold mb-4"
          >
            Diagnóstico empresarial gratuito
          </motion.div>
          <motion.h1
            variants={{ oculto: { opacity: 0, y: 14 }, visivel: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[38px] leading-[1.12] text-white mb-4"
          >
            Qual é o estágio real de maturidade do seu negócio?
          </motion.h1>
          <motion.p
            variants={{ oculto: { opacity: 0, y: 10 }, visivel: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14.5px] text-white/55 leading-relaxed mb-10"
          >
            {perguntas.length || 7} perguntas, menos de 3 minutos. No final você recebe um retrato honesto de onde
            sua empresa está — e nossa equipe entra em contato pra te mostrar o próximo passo.
          </motion.p>

          <motion.form
            variants={{ oculto: { opacity: 0, y: 10 }, visivel: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={avancarContato}
            className="flex flex-col gap-3"
          >
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Nome completo"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#4B93E8] focus:bg-white/[0.06] transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#4B93E8] focus:bg-white/[0.06] transition-colors"
            />
            <input
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Celular (com DDD)"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#4B93E8] focus:bg-white/[0.06] transition-colors"
            />
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
              disabled={perguntas.length === 0}
              className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-semibold bg-[#004AAD] text-white mt-3 hover:bg-[#0057C7] transition-colors disabled:opacity-50"
            >
              Começar diagnóstico
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.form>
        </motion.div>
      </div>
    );
  }

  // ---------- ETAPA 2: PERGUNTAS (papel claro, uma por vez) ----------
  if (etapa === "pergunta" || etapa === "enviando") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] textura-diagnostico flex flex-col">
        <div className="h-[3px] bg-[#e8e6e0] w-full">
          <motion.div
            className="h-full bg-[#004AAD]"
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[560px]">
            <div className="flex items-center justify-between mb-8">
              <div className="opacity-90">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={empresa} className="h-6 w-auto max-w-[130px] object-contain" />
                ) : (
                  <span className="text-[11.5px] tracking-[0.14em] text-[#004AAD] uppercase font-semibold">{empresa}</span>
                )}
              </div>
              <span className="text-[11.5px] text-[#9aa0ac] font-medium tabular-nums">
                {indice + 1} / {perguntas.length}
              </span>
            </div>

            <AnimatePresence mode="wait" custom={direcao}>
              <motion.div
                key={perguntaAtual?.id ?? "carregando"}
                custom={direcao}
                variants={variantes}
                initial="entra"
                animate="centro"
                exit="sai"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {perguntaAtual ? (
                  <>
                    <h2 className="font-display text-[28px] leading-[1.25] text-[#16181d] mb-10">
                      {perguntaAtual.texto}
                    </h2>

                    <div className="mb-2">
                      <div className="flex items-baseline justify-between mb-5">
                        <span className="text-[11.5px] text-[#9aa0ac]">Não existe hoje</span>
                        <span className="font-display text-[44px] leading-none text-[#004AAD] tabular-nums">
                          {respostas[perguntaAtual.id] ?? 5}
                        </span>
                        <span className="text-[11.5px] text-[#9aa0ac]">Totalmente estruturado</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={respostas[perguntaAtual.id] ?? 5}
                        onChange={(e) =>
                          setRespostas((r) => ({ ...r, [perguntaAtual.id]: Number(e.target.value) }))
                        }
                        className="slider-instrumento w-full"
                        style={{
                          background: `linear-gradient(to right, #004AAD ${((respostas[perguntaAtual.id] ?? 5) / 10) * 100}%, #e4e2da ${((respostas[perguntaAtual.id] ?? 5) / 10) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between mt-1.5">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <span key={i} className="w-px h-1.5 bg-[#d8d5cc]" />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[240px]" />
                )}
              </motion.div>
            </AnimatePresence>

            {erroMsg && <div className="text-[13px] text-[#E0554F] mt-6">{erroMsg}</div>}

            <div className="flex items-center justify-between mt-12">
              <button
                onClick={anterior}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#767c88] hover:text-[#16181d] transition-colors"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <button
                onClick={proxima}
                disabled={etapa === "enviando"}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13.5px] font-semibold bg-[#16181d] text-white hover:bg-[#004AAD] transition-colors disabled:opacity-60"
              >
                {etapa === "enviando" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Calculando...
                  </>
                ) : indice < perguntas.length - 1 ? (
                  <>
                    Próxima <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Ver resultado <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- ETAPA 3: RESULTADO (retorna ao escuro) ----------
  if (etapa === "resultado" && resultado) {
    const f = faixa(resultado.nota);
    const circunferencia = 2 * Math.PI * 78;
    const preenchido = (resultado.nota / 10) * circunferencia;

    return (
      <div className="min-h-screen bg-[#101319] relative overflow-hidden flex items-center justify-center px-6 py-16">
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${f.cor}33, transparent 60%)` }}
        />
        <div className="absolute inset-0 textura-diagnostico opacity-[0.12]" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[440px] flex flex-col items-center text-center"
        >
          <div className="mb-8">
            <Marca empresa={empresa} logoUrl={logoUrl} tamanho="pequeno" />
          </div>

          <div className="relative w-[200px] h-[200px] mb-8">
            <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
              <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <motion.circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke={f.cor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                initial={{ strokeDashoffset: circunferencia }}
                animate={{ strokeDashoffset: circunferencia - preenchido }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[52px] leading-none text-white tabular-nums">{resultado.nota.toFixed(1)}</span>
              <span className="text-[11px] text-white/40 mt-1">de 10</span>
            </div>
          </div>

          <span
            className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide"
            style={{ background: `${f.cor}22`, color: f.cor }}
          >
            {f.label}
          </span>

          <h1 className="font-display text-[24px] leading-snug text-white mb-3">
            Obrigado, {nome.split(" ")[0]}.
          </h1>
          <p className="text-[14px] text-white/55 leading-relaxed max-w-[380px]">{f.texto}</p>
          <p className="text-[13px] text-white/40 leading-relaxed max-w-[380px] mt-4">
            Nossa equipe vai analisar suas respostas com calma e entrar em contato em breve pra te mostrar o que
            esse resultado significa na prática.
          </p>
        </motion.div>
      </div>
    );
  }

  return null;
}
