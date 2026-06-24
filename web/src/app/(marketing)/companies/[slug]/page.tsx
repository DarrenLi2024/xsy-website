import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getApprovedCompanyBySlug } from "@/lib/data/public-detail";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getApprovedCompanyBySlug(slug);
  if (!c) return { title: "企业未找到" };
  return { title: c.name, description: c.description ?? undefined };
}

export const revalidate = 60;

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const company = await safeQuery(() => getApprovedCompanyBySlug(slug), null, "CompanyDetailPage");
  if (!company) notFound();

  return (
    <div>
      {/* 企业头部 — 关键路径 */}
      <div className="border-b border-black/[0.06] bg-[#f5f5f7]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:px-10 lg:px-12">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm md:h-28 md:w-28">
            {company.logo ? (
              <Image src={company.logo} alt={`${company.name} logo`} width={112} height={112} className="object-contain" />
            ) : (
              <span className="text-3xl font-semibold text-[#86868b]">{company.name.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <h1 className="text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">{company.name}</h1>
            <p className="mt-2 text-[15px] text-[#6e6e73]">
              {[company.industry, company.city, company.scale].filter(Boolean).join(" · ")}
            </p>
            {company.website ? (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[14px] font-medium text-[var(--accent)] transition hover:opacity-75">官方网站</a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:px-12">
        {/* 企业介绍 — 关键路径 */}
        {company.description ? (
          <section className="mb-16">
            <h2 className="text-[1.25rem] font-semibold text-[#1d1d1f]">企业介绍</h2>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#424245]">{company.description}</p>
          </section>
        ) : null}
        {/* 产品/动态/职位 — 流式加载 */}
        <Suspense fallback={<SectionSkeleton />}>
          <ProductList companyId={company.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductList({ companyId }: { companyId: string }) {
  const data = await safeQuery(
    () => getApprovedCompanyBySlug(companyId),
    null,
    "CompanyDetailProducts",
  );
  if (!data) return null;

  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-[1.25rem] font-semibold text-[#1d1d1f]">产品</h2>
        {data.products.length === 0 ? (
          <p className="mt-4 text-[15px] text-[#6e6e73]">暂无产品信息。</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.products.map((p) => (
              <li key={p.id} className="rounded-xl border border-black/[0.06] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <p className="font-medium text-[#1d1d1f]">{p.name}</p>
                {p.category ? <p className="text-[12px] text-[#86868b]">{p.category}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-[1.25rem] font-semibold text-[#1d1d1f]">动态</h2>
        {data.articles.length === 0 ? (
          <p className="mt-4 text-[15px] text-[#6e6e73]">暂无文章。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`} className="text-[15px] font-medium text-[var(--accent)] transition hover:opacity-75">{a.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-[1.25rem] font-semibold text-[#1d1d1f]">在招职位</h2>
        {data.jobs.length === 0 ? (
          <p className="mt-4 text-[15px] text-[#6e6e73]">暂无在招职位。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="text-[15px] font-medium text-[var(--accent)] transition hover:opacity-75">{j.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-16">
      <div><div className="h-5 w-16 rounded bg-[#f5f5f7]" /><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="h-16 rounded-xl border border-black/[0.06] bg-white"></div><div className="h-16 rounded-xl border border-black/[0.06] bg-white"></div></div></div>
      <div><div className="h-5 w-16 rounded bg-[#f5f5f7]" /><div className="mt-4 space-y-3"><div className="h-5 w-3/4 rounded bg-[#f5f5f7]" /><div className="h-5 w-1/2 rounded bg-[#f5f5f7]" /></div></div>
    </div>
  );
}
