import { MoreHorizontal, Flame, Thermometer, Snowflake, XCircle } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./Avatar";

export type Oportunidade = {
  id: string;
  empresa: string;
  etapa: string;
  valor: number;
  prob: number;
  dias: number;
  resp: string;
  temperatura?: string;
  perdida?: boolean;
};

const temperaturaIcon: Record<string, any> = {
  Quente: Flame,
  Morno: Thermometer,
  Frio: Snowflake,
};

const temperaturaCor: Record<string, string> = {
  Quente: "#f04438",
  Morno: "#f59e0b",
  Frio: "#06b6d4",
};

function formatarValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function OportunidadeCard({ op }: { op: Oportunidade }) {
  const TempIcon = temperaturaIcon[op.temperatura ?? "Morno"] ?? Thermometer;

  return (
    <Link
      href={`/crm/${op.id}`}
      className={`bg-white border rounded-xl p-3.5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] cursor-pointer hover:border-[#d8dce2] transition-colors ${
        op.perdida ? "border-[#f5c2bd] opacity-70" : "border-[#eef0f2]"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-[#16181d] leading-tight">{op.empresa}</span>
        {op.perdida ? (
          <XCircle size={15} color="#f04438" />
        ) : (
          <MoreHorizontal size={15} color="#c2c6cd" />
        )}
      </div>
      <span className="text-sm font-bold text-primary">{formatarValor(op.valor)}</span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar initials={op.resp || "—"} size={22} />
          <span className="text-[11.5px] text-[#9aa0ac]">{op.dias}d na etapa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TempIcon size={12} color={temperaturaCor[op.temperatura ?? "Morno"]} />
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[#eaf1fb] text-primary">
            {op.prob}%
          </span>
        </div>
      </div>
    </Link>
  );
}
