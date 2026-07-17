const palette = ["#0e9f6e", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4"];

export function Avatar({
  initials,
  size = 28,
}: {
  initials: string;
  size?: number;
}) {
  const color = palette[initials.charCodeAt(0) % palette.length];
  return (
    <div
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      className="rounded-full text-white font-semibold flex items-center justify-center shrink-0"
    >
      {initials}
    </div>
  );
}
