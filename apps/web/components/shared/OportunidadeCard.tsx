import { MoreHorizontal } from "lucide-react";
import { Avatar } from "./Avatar";

export type Oportunidade = {
  id: number;
  empresa: string;
  etapa: string;
  valor: string;
  prob: number;
  dias: number;
  resp: string;
};

export default function OportunidadeCard({ op }: { op: Oportunidade }) {
  return (
    <div className="bg-white border border-[#eef0f2] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] cursor-pointer">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-[#16181d] leading-tight">{op.empresa}</span>
        <MoreHorizontal size={15} color="#c2c6cd" />
      </div>
      <span className="text-sm font-bold text-primary">{op.valor}</span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar initials={op.resp} size={22} />
          <span className="text-[11.5px] text-[#9aa0ac]">{op.dias}d na etapa</span>
        </div>
        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0fbf6] text-primary">
          {op.prob}%
        </span>
      </div>
    </div>
  );
}
