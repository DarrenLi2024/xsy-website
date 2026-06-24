import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "报告",
  description: "行业报告与市场分析。",
};

export const revalidate = 60;

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20 lg:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Reports</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">报告</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6e6e73]">行业白皮书与研究报告。</p>
      <Suspense fallback={<ListSkeleton />}>
        <ReportsList />
      </Suspense>
    </div>
  );
}

async function ReportsList() {
  const reports = await safeQuery(
    () => prisma.report.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 40,
      select: { id: true, title: true, description: true, coverImage: true, category: true, price: true },
    }),
    [],
    "ReportsPage",
  );

  if (reports.length === 0) {
    return <p className="mt-12 text-[15px] text-[#6e6e73]">暂无报告。</p>;
  }

  return (
    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => (
        <li key={r.id}>
          <Link href={`/reports/${r.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="relative aspect-[16/10] w-full bg-[#f5f5f7]">
              {r.coverImage ? (
                <Image src={r.coverImage} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100" sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />
              )}
            </div>
            <div className="flex flex-col gap-1 p-5">
              <p className="font-semibold text-[17px] tracking-tight text-[#1d1d1f] leading-snug line-clamp-2">{r.title}</p>
              {r.description ? <p className="mt-1 line-clamp-2 text-[13px] text-[#6e6e73]">{r.description}</p> : null}
              <span className="mt-3 text-[13px] font-medium text-[var(--accent)]">{r.price != null && r.price > 0 ? `¥${r.price}` : "免费"}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          <div className="aspect-[16/10] bg-[#f5f5f7]" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-3/4 rounded bg-[#f5f5f7]" />
            <div className="h-3 w-1/2 rounded bg-[#f5f5f7]" />
          </div>
        </div>
      ))}
    </div>
  );
}
