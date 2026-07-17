import { FileText, Download } from "lucide-react";
import { relatoriosGerados } from "@/lib/mock-data";

const tipoStyles: Record<string, string> = {
  "Diagnóstico": "bg-[#eaf1fb] text-primary",
  "Plano de Trabalho": "bg-[#fff6e6] text-[#b45309]",
  "Visita": "bg-[#eafaf1] text-[#0e9f6e]",
  "Resumo Executivo": "bg-[#f3e8fd] text-[#9333ea]",
  "Indicadores": "bg-[#f5f6f8] text-[#767c88]",
};

export default function RelatoriosList() {
  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4">
      <div className="flex flex-col gap-2.5">
        {relatoriosGerados.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#eef0f2] rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#f5f6f8] flex items-center justify-center shrink-0">
              <FileText size={18} color="#5b6270" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-[#16181d]">{r.nome}</div>
              <div className="text-[12px] text-[#9aa0ac] mt-0.5">Gerado em {r.data}</div>
            </div>
            <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${tipoStyles[r.tipo]}`}>
              {r.tipo}
            </span>
            <button className="w-9 h-9 rounded-lg border border-[#e4e6ea] flex items-center justify-center text-[#5b6270] hover:bg-[#f5f6f8]">
              <Download size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
