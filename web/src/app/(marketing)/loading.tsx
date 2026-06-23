export default function MarketingLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto h-8 w-3/4 rounded-lg bg-slate-200" />
        <div className="mx-auto mt-4 h-4 w-1/2 rounded-lg bg-slate-100" />
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 p-4">
              <div className="aspect-video rounded-xl bg-slate-200" />
              <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
