import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CompanyStatus } from "@prisma/client";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "企业",
  description: "半导体企业名录与品牌主页。",
};

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await safeQuery(
    () =>
      prisma.company.findMany({
        where: { status: CompanyStatus.APPROVED, deletedAt: null },
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          logo: true,
          industry: true,
          city: true,
          description: true,
        },
      }),
    [],
    "CompaniesPage",
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20 lg:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Directory</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">
        企业名录
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6e6e73]">
        已通过审核的入驻企业（演示数据）。
      </p>
      {companies.length === 0 ? (
        <p className="mt-12 text-[15px] text-[#6e6e73]">暂无入驻企业。</p>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
          <Link
            key={c.slug}
            href={`/companies/${c.slug}`}
            className="flex gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.06] bg-[#f5f5f7]">
              {c.logo ? (
                <Image src={c.logo} alt={`${c.name} logo`} width={56} height={56} className="object-contain" />
              ) : (
                <span className="text-lg font-semibold text-[#86868b]">{c.name.slice(0, 1)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold tracking-tight text-[#1d1d1f]">{c.name}</h2>
              <p className="mt-1 text-[12px] text-[#86868b]">
                {[c.industry, c.city].filter(Boolean).join(" · ")}
              </p>
              {c.description ? (
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6e6e73]">
                  {c.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
