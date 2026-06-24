import type { Metadata } from "next";
import Link from "next/link";
import { getPublicJobsList } from "@/lib/data/public-lists";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "招聘",
  description: "半导体企业招聘职位。",
};

export const revalidate = 60;

export default async function JobsPage() {
  const jobs = await safeQuery(() => getPublicJobsList(), [], "JobsPage");

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20 lg:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Careers</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">招聘</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6e6e73]">垂直领域职位机会。</p>
      {jobs.length === 0 ? (
        <p className="mt-12 text-[15px] text-[#6e6e73]">暂无招聘职位。</p>
      ) : (
        <ul className="mt-12 divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {jobs.map((j) => (
            <li key={j.id}>
              <div className="flex flex-col gap-1 px-6 py-5 transition-colors hover:bg-[#f5f5f7]/80 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/jobs/${j.id}`} className="text-[16px] font-semibold text-[#1d1d1f] transition hover:text-[var(--accent)]">{j.title}</Link>
                  <p className="mt-1 text-[13px] text-[#6e6e73]">
                    <Link href={`/companies/${j.company.slug}`} className="font-medium text-[var(--accent)] transition hover:opacity-75">{j.company.name}</Link>
                    {j.city ? ` · ${j.city}` : ""}
                  </p>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868b]">{j.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
