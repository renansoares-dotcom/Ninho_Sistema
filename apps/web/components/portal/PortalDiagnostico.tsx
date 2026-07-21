"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ClipboardCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { areasDiagnostico } from "@/lib/mock-data";
import { usePortal } from "./PortalContext";

type Campanha = { id: string; titulo: string };

export default function PortalDiagnostico() {
  const { clienteId, tenantId } = usePortal();
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [podeResponder, setPodeResponder] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, number>>(
    Object.fromEntries(areasDiagnostico.map((a) => [a.area, 5]))
  );

  useEffect(() => {
    async function carregar() {
      const { data: campanhaAtiva } = await supabase
        .from("diagnostico_campanhas")
        .select("id, titulo")
        .eq("ativa", true)
        .maybeSingle();

      if (!campanhaAtiva) {
        setCampanha(null);
        setCarregando(false);
        return;
      }
      setCampanha(campanhaAtiva);

      const [{ data: ultimoEnvio }, { data: ultimaLiberacao }] = await Promise.all([
        supabase
          .from("diagnosticos")
          .select("created_at")
          .eq("campanha_id", campanhaAtiva.id)
          .eq("cliente_id", clienteId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("diagnostico_campanha_liberacoes")
          .select("liberado_em")
          .eq("campanha_id", campanhaAtiva.id)
          .eq("cliente_id", clienteId)
          .order("liberado_em", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!ultimoEnvio) {
        setPodeResponder(true);
      } else if (ultimaLiberacao && new Date(ultimaLiberacao.liberado_em) > new Date(ultimoEnvio.created_at)) {
        setPodeResponder(true);
      } else {
        setPodeResponder(false);
      }

      setCarregando(false);
    }
    carregar();
  }, [clienteId]);

  const indiceGeral = useMemo(() => {
    const valores = Object.values(notas);
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }, [notas]);

  async function enviar() {
    if (!campanha) return;
    setSalvando(true);
    setErro(null);

    const { data: diag, error } = await supabase
      .from("diagnosticos")
      .insert({
        tenant_id: tenantId,
        cliente_id: clienteId,
        campanha_id: campanha.id,
        data: new Date().toISOString().slice(0, 10),
        status: "Concluído",
        indice_maturidade_geral: indiceGeral,
      })
      .select("id")
      .single();

    if (error || !diag) {
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
      setSalvando(false);
      return;
    }

    const { error: erroAreas } = await supabase.from("diagnostico_areas").insert(
      areasDiagnostico.map((a) => ({
        diagnostico_id: diag.id,
        area: a.area,
        nota: notas[a.area],
      }))
    );

    setSalvando(false);

    if (erroAreas) {
      setErro("Suas notas gerais foram salvas, mas houve um problema ao salvar os detalhes por área.");
      return;
    }

    setEnviado(true);
  }

  if (carregando) {
    return (
      <div className="max-w-[900px] mx-auto px-7 py-20 flex items-center justify-center gap-2 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" /> Carregando...
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="max-w-[900px] mx-auto px-7 py-20 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#f5f6f8] flex items-center justify-center mb-5">
          <ClipboardCheck size={22} className="text-[#9aa0ac]" />
        </div>
        <h1 className="text-[17px] font-semibold text-[#16181d]">Nenhum diagnóstico disponível agora</h1>
        <p className="text-[13.5px] text-[#767c88] mt-2 max-w-[400px]">
          Sua consultoria ainda não abriu um novo ciclo de diagnóstico de acompanhamento. Assim que abrir, você
          verá um aviso aqui e no Meu Painel.
        </p>
        <button onClick={() => router.push("/portal")} className="mt-5 text-[13px] font-medium text-primary hover:underline">
          Voltar ao Meu Painel
        </button>
      </div>
    );
  }

  if (enviado || !podeResponder) {
    return (
      <div className="max-w-[900px] mx-auto px-7 py-20 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#eafaf1] flex items-center justify-center mb-5">
          <CheckCircle2 size={22} className="text-[#0e9f6e]" />
        </div>
        <h1 className="text-[17px] font-semibold text-[#16181d]">
          {enviado ? "Diagnóstico enviado — obrigado!" : "Você já respondeu esse diagnóstico"}
        </h1>
        <p className="text-[13.5px] text-[#767c88] mt-2 max-w-[400px]">
          Sua consultoria já recebeu suas respostas para &quot;{campanha.titulo}&quot;. Se precisar preencher de
          novo por algum motivo, peça ao seu consultor para liberar um novo envio.
        </p>
        <button onClick={() => router.push("/portal")} className="mt-5 text-[13px] font-medium text-primary hover:underline">
          Voltar ao Meu Painel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-7 py-7 flex flex-col gap-5">
      <div>
        <div className="text-[11.5px] font-semibold text-primary uppercase tracking-wide mb-1">{campanha.titulo}</div>
        <h1 className="text-[19px] font-semibold text-[#16181d]">Diagnóstico de Acompanhamento</h1>
        <p className="text-[13px] text-[#767c88] mt-1">
          Avalie de 0 a 10 o quanto cada área está estruturada hoje na sua empresa. Sem certo ou errado — quanto
          mais sincero, mais útil fica pra sua consultoria te ajudar.
        </p>
      </div>

      {erro && <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-4 py-3">{erro}</div>}

      <div className="grid grid-cols-2 gap-3.5">
        {areasDiagnostico.map((a) => (
          <div key={a.area} className="bg-white border border-[#eef0f2] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13.5px] font-semibold text-[#16181d]">{a.area}</span>
              <span className="text-[15px] font-bold text-primary">{notas[a.area]}</span>
            </div>
            <ul className="text-[11.5px] text-[#9aa0ac] mb-2.5 list-disc list-inside">
              {a.perguntas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <input
              type="range"
              min={0}
              max={10}
              value={notas[a.area]}
              onChange={(e) => setNotas((prev) => ({ ...prev, [a.area]: Number(e.target.value) }))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white border border-[#eef0f2] rounded-2xl p-4 sticky bottom-4">
        <div>
          <div className="text-[11.5px] text-[#9aa0ac]">Índice geral</div>
          <div className="text-[18px] font-bold text-[#16181d]">{indiceGeral.toFixed(1)} / 10</div>
        </div>
        <button
          onClick={enviar}
          disabled={salvando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-primary text-white shadow-sm disabled:opacity-60"
        >
          {salvando ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          Enviar diagnóstico
        </button>
      </div>
    </div>
  );
}
