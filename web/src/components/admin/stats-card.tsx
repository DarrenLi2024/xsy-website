export default function StatsCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
        {value}
      </p>
      {trend && (
        <p
          className={`mt-1 text-xs ${
            trend.positive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}
