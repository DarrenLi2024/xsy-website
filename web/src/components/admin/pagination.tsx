import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          上一页
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-600">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={`${basePath}?page=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              p === currentPage
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
