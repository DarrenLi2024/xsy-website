import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { formatDateZh } from "@/lib/format-date";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "资讯",
  description: "半导体产业深度文章与动态。",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const filter = category?.trim();

  const articles = await safeQuery(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          deletedAt: null,
          ...(filter ? { category: filter } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverImage: true,
          category: true,
          publishedAt: true,
        },
      }),
    [],
    "ArticlesPage",
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20 lg:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Stories</p>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">
            {filter ? filter : "资讯"}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6e6e73]">
            {filter ? `筛选：${filter}` : "最新深度内容与行业动态。"}
            {filter ? (
              <Link href="/articles" className="ml-3 text-[13px] font-medium text-[var(--accent)] hover:opacity-75">
                清除筛选
              </Link>
            ) : null}
          </p>
        </div>
      </div>
      {articles.length === 0 ? (
        <p className="mt-12 text-[15px] text-[#6e6e73]">该分类暂无文章。</p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/articles/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="relative aspect-[16/10] bg-[#f5f5f7]">
                  {a.coverImage ? (
                    <Image
                      src={a.coverImage}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
                    {a.category ?? "资讯"}
                  </span>
                  <h2 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-[#1d1d1f]">
                    {a.title}
                  </h2>
                  <p className="mt-2 text-[12px] text-[#86868b]">{formatDateZh(a.publishedAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
