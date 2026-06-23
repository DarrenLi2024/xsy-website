export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded-lg bg-white/10" />
        <div className="h-9 w-24 rounded-lg bg-white/10" />
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex gap-3">
          <div className="h-9 w-48 rounded-lg bg-white/10" />
          <div className="h-9 w-24 rounded-lg bg-white/10" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-12 rounded bg-white/10" />
              <div className="h-4 flex-1 rounded bg-white/5" />
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-4 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
