"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, CalendarDays, Video } from "lucide-react";
import { eventosAgenda } from "@/lib/mock-data";

const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const tipoIcon: Record<string, any> = {
  "Reunião": CalendarDays,
  "Visita técnica": MapPin,
  "Videoconferência": Video,
};

const tipoDot: Record<string, string> = {
  "Reunião": "bg-primary",
  "Visita técnica": "bg-[#0e9f6e]",
  "Videoconferência": "bg-[#b45309]",
};

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function AgendaCalendar() {
  const hoje = new Date("2026-07-17T12:00:00");
  const [cursor, setCursor] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
  const [selecionado, setSelecionado] = useState<string | null>(toISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));

  const { year, month } = cursor;
  const primeiroDiaSemana = new Date(year, month, 1).getDay();
  const totalDias = new Date(year, month + 1, 0).getDate();

  const celulas = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < primeiroDiaSemana; i++) arr.push(null);
    for (let d = 1; d <= totalDias; d++) arr.push(d);
    return arr;
  }, [primeiroDiaSemana, totalDias]);

  const eventosPorDia = (dia: number) => {
    const iso = toISO(year, month, dia);
    return eventosAgenda.filter((e) => e.dataISO === iso);
  };

  const eventosDoDiaSelecionado = selecionado
    ? eventosAgenda.filter((e) => e.dataISO === selecionado)
    : [];

  const proximos7Dias = useMemo(() => {
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 7);
    return eventosAgenda
      .filter((e) => {
        const d = new Date(e.dataISO + "T12:00:00");
        return d >= hoje && d <= limite;
      })
      .sort((a, b) => a.dataISO.localeCompare(b.dataISO));
  }, []);

  function mudarMes(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCursor({ year: y, month: m });
    setSelecionado(null);
  }

  function irParaHoje() {
    setCursor({ year: hoje.getFullYear(), month: hoje.getMonth() });
    setSelecionado(toISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  }

  return (
    <div className="grid grid-cols-[1fr_320px] gap-3.5">
      <div className="bg-white border border-[#eef0f2] rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => mudarMes(-1)}
              className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[14.5px] font-semibold text-[#16181d] w-[130px] text-center">
              {meses[month]} {year}
            </span>
            <button
              onClick={() => mudarMes(1)}
              className="w-7 h-7 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <button
            onClick={irParaHoje}
            className="text-[12.5px] font-medium text-primary hover:underline"
          >
            Hoje
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {diasSemana.map((d) => (
            <div key={d} className="text-[11px] font-semibold text-[#9aa0ac] text-center py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {celulas.map((dia, i) => {
            if (dia === null) return <div key={`vazio-${i}`} />;
            const iso = toISO(year, month, dia);
            const eventos = eventosPorDia(dia);
            const isHoje = iso === toISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
            const isSelecionado = iso === selecionado;
            return (
              <button
                key={iso}
                onClick={() => setSelecionado(iso)}
                className={`text-left rounded-xl border p-2 min-h-[74px] flex flex-col gap-1 transition-colors ${
                  isSelecionado
                    ? "border-primary bg-[#eaf1fb]"
                    : "border-[#f2f3f5] hover:border-[#e4e6ea]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[12.5px] ${isHoje ? "font-bold text-primary" : "text-[#3f434d]"}`}>
                    {dia}
                  </span>
                  {isHoje && <span className="w-1 h-1 rounded-full bg-primary" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  {eventos.slice(0, 2).map((e) => (
                    <div key={e.id} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tipoDot[e.tipo]}`} />
                      <span className="text-[10px] text-[#5b6270] truncate">{e.titulo.split("—")[0].trim()}</span>
                    </div>
                  ))}
                  {eventos.length > 2 && (
                    <span className="text-[10px] text-[#9aa0ac]">+{eventos.length - 2} mais</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="text-[13px] font-semibold text-[#16181d] mb-3">
            {selecionado ? `Eventos — ${selecionado.split("-").reverse().join("/")}` : "Selecione um dia"}
          </div>
          {!selecionado && (
            <p className="text-[12.5px] text-[#9aa0ac]">Clique em um dia para ver os eventos.</p>
          )}
          {selecionado && eventosDoDiaSelecionado.length === 0 && (
            <p className="text-[12.5px] text-[#9aa0ac]">Nenhum evento neste dia.</p>
          )}
          <div className="flex flex-col gap-2">
            {eventosDoDiaSelecionado.map((e) => {
              const Icon = tipoIcon[e.tipo] ?? CalendarDays;
              return (
                <div key={e.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#fafbfc]">
                  <Icon size={14} color="#004AAD" className="mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[12.5px] font-medium text-[#16181d] leading-snug">{e.titulo}</div>
                    <div className="text-[11px] text-[#9aa0ac] mt-0.5">{e.hora} · {e.tipo}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#eef0f2] rounded-2xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="text-[13px] font-semibold text-[#16181d] mb-3">Próximos 7 dias</div>
          {proximos7Dias.length === 0 && (
            <p className="text-[12.5px] text-[#9aa0ac]">Nenhum evento nos próximos 7 dias.</p>
          )}
          <div className="flex flex-col gap-2">
            {proximos7Dias.map((e) => (
              <div key={e.id} className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tipoDot[e.tipo]}`} />
                <span className="text-[12px] text-[#3f434d] flex-1 truncate">{e.titulo}</span>
                <span className="text-[11px] text-[#9aa0ac] shrink-0">
                  {e.dataISO.slice(8, 10)}/{e.dataISO.slice(5, 7)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
