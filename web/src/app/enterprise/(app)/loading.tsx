export default function EnterpriseLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded-lg bg-white/10" />
        <div className="h-9 w-24 rounded-lg bg-white/10" />
      </div>
      {/* Dashboard-style cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="mt-3 h-6 w-12 rounded bg-white/10" />
          </div>
        ))}
      </div>
      {/* List skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-12 rounded bg-white/10" />
              <div className="h-4 flex-1 rounded bg-white/5" />
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-4 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
