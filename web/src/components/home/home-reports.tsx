import Link from "next/link";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  reports: HomePagePayload["reports"];
};

export function HomeReports({ reports }: Props) {
  if (reports.length === 0) return null;

  return (
    <section
      id="section-reports"
      className="scroll-mt-32 border-t border-black/[0.06] bg-[#fbfbfd] py-20 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
              Reports
            </p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
              报告
            </h2>
          </div>
          <Link
            href="/reports"
            className="shrink-0 text-[15px] font-medium text-[var(--accent)] transition duration-200 hover:opacity-75"
          >
            全部报告
          </Link>
        </div>
        <ul className="mt-8 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {reports.map((r) => (
            <li key={r.id}>
              <Link
                href={`/reports/${r.id}`}
                className="flex flex-col gap-1 px-6 py-5 transition duration-200 hover:bg-black/[0.02] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">{r.title}</p>
                  {r.description ? (
                    <p className="mt-1 line-clamp-1 text-[13px] text-[#6e6e73]">{r.description}</p>
                  ) : null}
                </div>
                <span className="text-[13px] font-medium text-[#424245]">
                  {r.price != null && r.price > 0 ? `¥${r.price}` : "免费"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
