import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

export default function KpiCard({
  label,
  value,
  delta,
  up,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: LucideIcon;
}) {
  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl p-[18px_20px] flex flex-col gap-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-[#767c88] font-medium">{label}</span>
        <div className="w-[30px] h-[30px] rounded-lg bg-[#f5f6f8] flex items-center justify-center">
          <Icon size={15} color="#5b6270" strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#16181d] tracking-tight">{value}</span>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            up ? "text-primary" : "text-[#f04438]"
          }`}
        >
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </span>
      </div>
    </div>
  );
}
