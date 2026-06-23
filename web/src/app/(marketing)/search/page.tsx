"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type CompanyResult = { id: string; name: string; slug: string; industry?: string; city?: string };
type ArticleResult = { id: string; title: string; slug: string; category?: string; summary?: string };
type ProductResult = { id: string; name: string; category?: string };

type SearchResults = {
  companies: CompanyResult[];
  articles: ArticleResult[];
  products: ProductResult[];
  error?: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const term = q.trim();

  const [results, setResults] = useState<SearchResults>({ companies: [], articles: [], products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!term) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(term)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => {
        setResults({ companies: [], articles: [], products: [], error: "搜索失败，请重试" });
        setLoading(false);
      });
  }, [term]);

  if (!term) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-20 md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Search</p>
        <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f]">搜索</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#6e6e73]">
          在顶部导航进入搜索，或在 URL 使用{" "}
          <code className="rounded-md border border-black/[0.08] bg-[#f5f5f7] px-2 py-0.5 font-mono text-[13px] text-[#1d1d1f]">
            ?q=关键词
          </code>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Results</p>
      <h1 className="mt-2 text-[1.5rem] font-semibold leading-snug tracking-tight text-[#1d1d1f] md:text-[1.75rem]">
        「{term}」的搜索结果
      </h1>

      {loading && (
        <div className="mt-12 text-center text-[15px] text-[#86868b]">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="mt-3">正在搜索...</p>
        </div>
      )}

      {results.error && !loading && (
        <p className="mt-12 text-[15px] text-red-500">{results.error}</p>
      )}

      {!loading && (
        <>
          <section className="mt-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
              企业 ({results.companies.length})
            </h2>
            <ul className="mt-4 space-y-3">
              {results.companies.length === 0 ? (
                <li className="text-[14px] text-[#86868b]">无匹配企业</li>
              ) : (
                results.companies.map((c) => (
                  <li key={c.id} className="rounded-xl border border-black/[0.06] bg-white p-4">
                    <Link
                      href={`/companies/${c.slug}`}
                      className="text-[15px] font-semibold text-[var(--accent)] transition hover:opacity-75"
                    >
                      {c.name}
                    </Link>
                    <div className="mt-1 flex gap-3 text-[12px] text-[#86868b]">
                      {c.industry && <span>{c.industry}</span>}
                      {c.city && <span>{c.city}</span>}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
              文章 ({results.articles.length})
            </h2>
            <ul className="mt-4 space-y-3">
              {results.articles.length === 0 ? (
                <li className="text-[14px] text-[#86868b]">无匹配文章</li>
              ) : (
                results.articles.map((a) => (
                  <li key={a.id} className="rounded-xl border border-black/[0.06] bg-white p-4">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-[15px] font-semibold text-[var(--accent)] transition hover:opacity-75"
                    >
                      {a.title}
                    </Link>
                    {a.summary && (
                      <p className="mt-1 text-[13px] leading-relaxed text-[#86868b] line-clamp-2">{a.summary}</p>
                    )}
                    {a.category && (
                      <span className="mt-2 inline-block text-[11px] text-[#aeaeb2]">{a.category}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
              产品 ({results.products.length})
            </h2>
            <ul className="mt-4 space-y-3">
              {results.products.length === 0 ? (
                <li className="text-[14px] text-[#86868b]">无匹配产品</li>
              ) : (
                results.products.map((p) => (
                  <li key={p.id} className="rounded-xl border border-black/[0.06] bg-white p-4">
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{p.name}</span>
                    {p.category && (
                      <span className="ml-2 text-[12px] text-[#86868b]">{p.category}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
