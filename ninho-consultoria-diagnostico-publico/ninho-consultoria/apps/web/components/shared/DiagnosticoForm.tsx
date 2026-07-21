"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Card from "@/components/shared/Card";
import { areasDiagnostico } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { gerarTarefaAposDiagnostico } from "@/lib/automacoes";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export default function DiagnosticoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editarId = searchParams.get("editar");

  const [clienteId, setClienteId] = useState(searchParams.get("cliente") ?? "");
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [resumoExecutivo, setResumoExecutivo] = useState("");
  const [pontosFortes, setPontosFortes] = useState("");
  const [oportunidadesMelhoria, setOportunidadesMelhoria] = useState("");
  const [riscos, setRiscos] = useState("");
  const [notas, setNotas] = useState<Record<string, number>>(
    Object.fromEntries(areasDiagnostico.map((a) => [a.area, 5]))
  );
  const [carregandoExistente, setCarregandoExistente] = useState(!!editarId);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("clientes")
      .select("id, nome_fantasia, razao_social")
      .order("nome_fantasia")
      .then(({ data }) => {
        setClientes((data ?? []).map((c) => ({ id: c.id, nome: c.nome_fantasia ?? c.razao_social })));
      });
  }, []);

  useEffect(() => {
    if (!editarId) return;
    async function carregarExistente() {
      setCarregandoExistente(true);
      const [{ data: diag }, { data: areas }] = await Promise.all([
        supabase.from("diagnosticos").select("*").eq("id", editarId).single(),
        supabase.from("diagnostico_areas").select("area, nota").eq("diagnostico_id", editarId),
      ]);

      if (diag) {
        setClienteId(diag.cliente_id ?? "");
        setResumoExecutivo(diag.resumo_executivo ?? "");
        setPontosFortes((diag.pontos_fortes ?? []).join("\n"));
        setOportunidadesMelhoria((diag.oportunidades_melhoria ?? []).join("\n"));
        setRiscos((diag.riscos ?? []).join("\n"));
      }
      if (areas && areas.length > 0) {
        const notasCarregadas: Record<string, number> = {};
        areas.forEach((a) => { notasCarregadas[a.area] = a.nota; });
        setNotas((prev) => ({ ...prev, ...notasCarregadas }));
      }
      setCarregandoExistente(false);
    }
    carregarExistente();
  }, [editarId]);

  const dadosRadar = useMemo(
    () => areasDiagnostico.map((a) => ({ area: a.area, nota: notas[a.area] })),
    [notas]
  );

  const indiceGeral = useMemo(() => {
    const valores = Object.values(notas);
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }, [notas]);

  async function salvar() {
    if (!clienteId) {
      setErro("Selecione o cliente antes de salvar o diagnóstico.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const camposComuns = {
      cliente_id: clienteId,
      status: "Concluído",
      indice_maturidade_geral: indiceGeral,
      resumo_executivo: resumoExecutivo || null,
      pontos_fortes: pontosFortes.split("\n").map((s) => s.trim()).filter(Boolean),
      oportunidades_melhoria: oportunidadesMelhoria.split("\n").map((s) => s.trim()).filter(Boolean),
      riscos: riscos.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    let diagnosticoId = editarId;

    if (editarId) {
      const { error } = await supabase.from("diagnosticos").update(camposComuns).eq("id", editarId);
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
      // Substitui as áreas: remove as antigas e insere as atuais
      await supabase.from("diagnostico_areas").delete().eq("diagnostico_id", editarId);
    } else {
      const { data: diag, error } = await supabase
        .from("diagnosticos")
        .insert({ tenant_id: TENANT_ID, data: new Date().toISOString().slice(0, 10), ...camposComuns })
        .select("id")
        .single();

      if (error || !diag) {
        setErro(error?.message ?? "Erro ao salvar diagnóstico.");
        setSalvando(false);
        return;
      }
      diagnosticoId = diag.id;
    }

    const { error: erroAreas } = await supabase.from("diagnostico_areas").insert(
      areasDiagnostico.map((a) => ({
        diagnostico_id: diagnosticoId,
        area: a.area,
        nota: notas[a.area],
      }))
    );

    setSalvando(false);

    if (erroAreas) {
      setErro(erroAreas.message);
      return;
    }

    if (!editarId) {
      const nomeCliente = clientes.find((c) => c.id === clienteId)?.nome ?? "Cliente";
      gerarTarefaAposDiagnostico(clienteId, nomeCliente);
    }

    router.push(`/diagnostico/${diagnosticoId}`);
  }

  if (carregandoExistente) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[#9aa0ac] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Carregando diagnóstico...
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 grid grid-cols-[1.3fr_1fr] gap-3.5 items-start">
      <div className="flex flex-col gap-3.5">
        <Card title="Cliente">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={!!editarId}
            className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary disabled:bg-[#f5f6f8] disabled:text-[#9aa0ac]"
          >
            <option value="">Selecione o cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </Card>

        {areasDiagnostico.map((a) => (
          <Card key={a.area} title={a.area}>
            <div className="flex flex-col gap-4">
              {a.perguntas.map((p, i) => (
                <p key={i} className="text-[13px] text-[#3f434d] leading-relaxed">
                  {p}
                </p>
              ))}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[#9aa0ac]">Nota geral da área</span>
                  <span className="text-[13px] font-semibold text-primary">{notas[a.area].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={notas[a.area]}
                  onChange={(e) =>
                    setNotas((prev) => ({ ...prev, [a.area]: Number(e.target.value) }))
                  }
                  className="w-full accent-[#004AAD]"
                />
              </div>
            </div>
          </Card>
        ))}

        <Card title="Resumo executivo (opcional)">
          <textarea
            value={resumoExecutivo}
            onChange={(e) => setResumoExecutivo(e.target.value)}
            rows={3}
            placeholder="Síntese geral do diagnóstico..."
            className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary resize-none"
          />
        </Card>

        <Card title="Pontos fortes (um por linha, opcional)">
          <textarea
            value={pontosFortes}
            onChange={(e) => setPontosFortes(e.target.value)}
            rows={3}
            placeholder={"Ex: Área Comercial estruturada\nGestão com boa governança"}
            className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary resize-none"
          />
        </Card>

        <Card title="Oportunidades de melhoria (uma por linha, opcional)">
          <textarea
            value={oportunidadesMelhoria}
            onChange={(e) => setOportunidadesMelhoria(e.target.value)}
            rows={3}
            placeholder={"Ex: Marketing sem plano formalizado"}
            className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary resize-none"
          />
        </Card>

        <Card title="Riscos identificados (um por linha, opcional)">
          <textarea
            value={riscos}
            onChange={(e) => setRiscos(e.target.value)}
            rows={3}
            placeholder={"Ex: Dependência de poucos fornecedores\nAlta rotatividade na equipe comercial"}
            className="w-full border border-[#e4e6ea] rounded-lg px-3 py-2.5 text-[13.5px] text-[#16181d] outline-none focus:border-primary resize-none"
          />
        </Card>
      </div>

      <div className="sticky top-[76px] flex flex-col gap-3.5">
        <Card title="Índice geral de maturidade">
          <div className="text-3xl font-bold text-primary mb-1">{indiceGeral.toFixed(1)} / 10</div>
          <p className="text-[12.5px] text-[#9aa0ac]">
            Calculado automaticamente a partir da média das {areasDiagnostico.length} áreas avaliadas.
          </p>
        </Card>

        <Card title="Radar por área">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dadosRadar}>
              <PolarGrid stroke="#eef0f2" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 10.5, fill: "#5b6270" }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9, fill: "#c2c6cd" }} />
              <Radar dataKey="nota" stroke="#004AAD" strokeWidth={2} fill="#004AAD" fillOpacity={0.18} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {erro && (
          <div className="text-[13px] text-[#f04438] bg-[#fdecea] rounded-lg px-3 py-2.5">{erro}</div>
        )}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full py-3 rounded-lg bg-primary text-white text-[13.5px] font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" />}
          {editarId ? "Salvar alterações" : "Concluir diagnóstico"}
        </button>
      </div>
    </div>
  );
}
