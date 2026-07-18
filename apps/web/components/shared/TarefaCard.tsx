import { MoreHorizontal } from "lucide-react";
import { Avatar } from "./Avatar";

export type Tarefa = {
  id: string;
  titulo: string;
  cliente: string;
  cliente_id: string | null;
  coluna: string;
  prioridade: string;
  prazo: string;
  prazoRaw: string | null;
  resp: string;
};

const prioridadeStyles: Record<string, string> = {
  Alta: "bg-[#fdecea] text-[#f04438]",
  Média: "bg-[#fff6e6] text-[#b45309]",
  Baixa: "bg-[#f5f6f8] text-[#767c88]",
};

export default function TarefaCard({ t, onClick }: { t: Tarefa; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#eef0f2] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] cursor-pointer hover:border-[#d8dce2] transition-colors"
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-[#16181d] leading-tight">{t.titulo}</span>
        <MoreHorizontal size={15} color="#c2c6cd" />
      </div>
      <span className="text-[12px] text-[#767c88]">{t.cliente}</span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar initials={t.resp} size={22} />
          <span className="text-[11.5px] text-[#9aa0ac]">{t.prazo}</span>
        </div>
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${prioridadeStyles[t.prioridade]}`}>
          {t.prioridade}
        </span>
      </div>
    </div>
  );
}
