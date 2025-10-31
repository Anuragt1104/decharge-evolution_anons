interface MetricCardProps {
  title: string;
  value: string;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  accent?: string;
  description?: string;
}

const trendIcon: Record<"up" | "down" | "flat", string> = {
  up: "▲",
  down: "▼",
  flat: "■",
};

const accentBackground: Record<string, string> = {
  emerald: "from-emerald-400/10 to-emerald-500/5",
  blue: "from-sky-400/10 to-blue-500/5",
  violet: "from-violet-400/10 to-indigo-500/5",
  amber: "from-amber-400/10 to-orange-500/5",
};

export function MetricCard({
  title,
  value,
  trend,
  accent = "emerald",
  description,
}: MetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br ${accentBackground[accent] ?? accentBackground.emerald} p-6 shadow-lg shadow-black/10 transition hover:border-white/10`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-white/60">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        {trend ? (
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            <span>{trendIcon[trend.direction]}</span>
            <span>{trend.label}</span>
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-white/70">{description}</p>
      ) : null}
    </div>
  );
}