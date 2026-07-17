import { diagnosticos } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  "Concluído": "bg-[#eafaf1] text-[#0e9f6e]",
  "Em andamento": "bg-[#eaf1fb] text-primary",
  "Em preenchimento": "bg-[#f5f6f8] text-[#767c88]",
};

export default function DiagnosticosList() {
  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#eef0f2]">
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Cliente</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Data</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Índice de maturidade</th>
            <th className="px-5 py-3 text-[12px] font-semibold text-[#9aa0ac] uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {diagnosticos.map((d) => (
            <tr key={d.id} className="border-b border-[#f2f3f5] last:border-b-0 hover:bg-[#fafbfc] cursor-pointer transition-colors">
              <td className="px-5 py-4 text-[13.5px] font-medium text-[#16181d]">{d.cliente}</td>
              <td className="px-5 py-4 text-[13px] text-[#5b6270]">{d.data}</td>
              <td className="px-5 py-4 text-[13px] font-semibold text-[#16181d]">
                {d.indice > 0 ? `${d.indice.toFixed(1)} / 10` : "—"}
              </td>
              <td className="px-5 py-4">
                <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${statusStyles[d.status]}`}>
                  {d.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
