import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";

export default function PageHeader({
  crumb,
  title,
  actionLabel,
  actionHref,
  secondaryLabel,
}: {
  crumb: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
}) {
  const actionButton = actionLabel && (
    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13.5px] font-semibold border-none bg-primary text-white shadow-sm">
      <Plus size={15} />
      {actionLabel}
    </button>
  );

  return (
    <div className="max-w-[1360px] mx-auto px-7 pt-[22px] pb-1 flex items-end justify-between">
      <div>
        <div className="text-[12.5px] text-[#9aa0ac] mb-1.5">{crumb}</div>
        <h1 className="text-[22px] font-semibold text-[#16181d] tracking-tight m-0">
          {title}
        </h1>
      </div>
      <div className="flex gap-2">
        {secondaryLabel && (
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium border border-[#e4e6ea] bg-white text-[#3f434d]">
            <SlidersHorizontal size={14} />
            {secondaryLabel}
          </button>
        )}
        {actionButton && (actionHref ? <Link href={actionHref}>{actionButton}</Link> : actionButton)}
      </div>
    </div>
  );
}
