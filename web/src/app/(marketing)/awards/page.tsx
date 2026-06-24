import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "评选",
  description: "硬核芯等品牌评选活动。",
};

export const revalidate = 60;

export default function AwardsPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Awards</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">评选</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
        年度评选与奖项说明（投票与参评流程可扩展）。
      </p>
      <Suspense fallback={<ListSkeleton />}>
        <AwardsList />
      </Suspense>
    </div>
  );
}

async function AwardsList() {
  const campaigns = await safeQuery(
    () => prisma.awardCampaign.findMany({ orderBy: { year: "desc" }, take: 20 }),
    [],
    "AwardsPage",
  );

  if (campaigns.length === 0) {
    return <p className="mt-12 text-[15px] text-[#6e6e73]">暂无评选活动。</p>;
  }

  return (
    <ul className="mt-12 space-y-5">
      {campaigns.map((c) => (
        <li key={c.id}>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="text-[1.25rem] font-semibold tracking-tight text-[#1d1d1f]">{c.title}</h2>
            <p className="mt-2 text-[13px] text-[#86868b]">
              {c.year} · {c.startDate.toLocaleDateString("zh-CN")} — {c.endDate.toLocaleDateString("zh-CN")}
            </p>
            {c.summary ? <p className="mt-4 text-[15px] leading-relaxed text-[#424245]">{c.summary}</p> : null}
            <Link href={`/awards/${c.slug}`} className="mt-6 inline-block text-[14px] font-semibold text-[var(--accent)] transition hover:opacity-75">
              查看详情
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-12 animate-pulse space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-6 space-y-3">
          <div className="h-5 w-2/3 rounded bg-[#f5f5f7]" />
          <div className="h-3 w-1/3 rounded bg-[#f5f5f7]" />
          <div className="h-3 w-3/4 rounded bg-[#f5f5f7]" />
        </div>
      ))}
    </div>
  );
}
