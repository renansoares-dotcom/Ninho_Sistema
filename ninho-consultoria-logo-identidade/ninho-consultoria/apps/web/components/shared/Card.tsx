export default function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#eef0f2] rounded-2xl p-[22px] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[#16181d]">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
