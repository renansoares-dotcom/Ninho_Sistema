"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { catalogoWidgets, WidgetId } from "@/lib/dashboard-widgets";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type Preferencia = { widget_id: WidgetId; visivel: boolean; ordem: number };

export default function DashboardPreferencesModal({
  open,
  onClose,
  onSaved,
  preferenciasIniciais,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  preferenciasIniciais: Preferencia[];
}) {
  const [lista, setLista] = useState<Preferencia[]>(preferenciasIniciais);
  const [salvando, setSalvando] = useState(false);

  if (!open) return null;

  function alternar(id: WidgetId) {
    setLista((prev) => prev.map((p) => (p.widget_id === id ? { ...p, visivel: !p.visivel } : p)));
  }

  function mover(id: WidgetId, direcao: -1 | 1) {
    setLista((prev) => {
      const ordenada = [...prev].sort((a, b) => a.ordem - b.ordem);
      const idx = ordenada.findIndex((p) => p.widget_id === id);
      const novoIdx = idx + direcao;
      if (novoIdx < 0 || novoIdx >= ordenada.length) return prev;
      [ordenada[idx], ordenada[novoIdx]] = [ordenada[novoIdx], ordenada[idx]];
      return ordenada.map((p, i) => ({ ...p, ordem: i }));
    });
  }

  async function salvar() {
    setSalvando(true);
    await Promise.all(
      lista.map((p) =>
        supabase.from("dashboard_preferencias").upsert(
          {
            tenant_id: TENANT_ID,
            widget_id: p.widget_id,
            visivel: p.visivel,
            ordem: p.ordem,
          },
          { onConflict: "tenant_id,widget_id" }
        )
      )
    );
    setSalvando(false);
    onSaved();
    onClose();
  }

  const ordenada = [...lista].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f2]">
          <span className="text-[15px] font-semibold text-[#16181d]">Personalizar dashboard</span>
          <button onClick={onClose} className="text-[#9aa0ac] hover:text-[#5b6270]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-2">
          <p className="text-[12.5px] text-[#9aa0ac] mb-1">
            Escolha quais blocos exibir e a ordem em que aparecem no dashboard.
          </p>
          {ordenada.map((p, i) => {
            const widget = catalogoWidgets.find((w) => w.id === p.widget_id)!;
            return (
              <div
                key={p.widget_id}
                className="flex items-center justify-between gap-2 border border-[#eef0f2] rounded-xl px-3.5 py-2.5"
              >
                <button
                  onClick={() => alternar(p.widget_id)}
                  className={`flex items-center gap-2 flex-1 text-left ${p.visivel ? "text-[#16181d]" : "text-[#c2c6cd]"}`}
                >
                  {p.visivel ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="text-[13px] font-medium">{widget.label}</span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => mover(p.widget_id, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#9aa0ac] hover:bg-[#f5f6f8] disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => mover(p.widget_id, 1)}
                    disabled={i === ordenada.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#9aa0ac] hover:bg-[#f5f6f8] disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#eef0f2]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13.5px] font-medium border border-[#e4e6ea] bg-white text-[#3f434d]"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-primary text-white disabled:opacity-60"
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
