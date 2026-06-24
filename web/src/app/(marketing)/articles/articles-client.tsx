"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { formatDateZh } from "@/lib/format-date";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
};

export default function ArticlesPageClient({
  articles,
  categories,
}: {
  articles: Article[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const [clientFilter, setClientFilter] = useState(searchParams.get("category") || "");

  const filtered = useMemo(
    () =>
      clientFilter
        ? articles.filter((a) => a.category === clientFilter)
        : articles,
    [articles, clientFilter],
  );

  return (
    <>
      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setClientFilter("")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              !clientFilter
                ? "bg-[#1d1d1f] text-white"
                : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]"
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setClientFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                clientFilter === cat
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-12 text-[15px] text-[#6e6e73]">该分类暂无文章。</p>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
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
                  <p className="mt-2 text-[12px] text-[#86868b]">
                    {a.publishedAt ? formatDateZh(a.publishedAt) : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
