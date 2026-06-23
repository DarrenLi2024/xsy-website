"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateZh } from "@/lib/format-date";
import {
  CardRoot,
  CardImage,
  CardTag,
  CardBody,
  CardTitle,
} from "@/components/ui/card";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  articles: HomePagePayload["latestArticles"];
  featuredArticles?: HomePagePayload["featuredArticles"];
};

export function HomeFeed({ articles, featuredArticles = [] }: Props) {
  if (articles.length === 0 && featuredArticles.length === 0) return null;
  const hasFeatured = featuredArticles.length > 0;

  return (
    <section
      id="section-feed"
      className="scroll-mt-32 border-t border-black/[0.06] bg-[#f5f5f7] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        {/* 头条精选 — AWS 风格横向卡片轮播 */}
        {hasFeatured && <FeaturedCarousel items={featuredArticles} />}

        {/* 资讯网格 */}
        <div className={hasFeatured ? "mt-20" : ""}>
          <div className="flex items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
                Stories
              </p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
                资讯
              </h2>
            </div>
            <Link
              href="/articles"
              className="shrink-0 text-[15px] font-medium text-[var(--accent)] transition duration-200 hover:opacity-75"
            >
              浏览全部
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`}>
                <CardRoot className="bg-white">
                  <CardImage>
                    <div className="relative aspect-[16/10] bg-[#f5f5f7]">
                      {a.coverImage ? (
                        <Image
                          src={a.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />
                      )}
                    </div>
                  </CardImage>
                  <CardBody>
                    <CardTag>{a.category ?? "资讯"}</CardTag>
                    <CardTitle className="mt-2 line-clamp-2 flex-1">
                      {a.title}
                    </CardTitle>
                    <p className="mt-4 text-[12px] text-[#86868b] transition-colors duration-300 group-hover:text-[var(--accent)]/60">
                      {formatDateZh(a.publishedAt)}
                    </p>
                  </CardBody>
                </CardRoot>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== AWS 风格头条横向轮播 ===== */

function FeaturedCarousel({
  items = [],
}: {
  items?: Props["featuredArticles"];
}) {
  const [current, setCurrent] = useState(0);
  const max = items.length;

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, max - 1));
  }, [max]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  // 自动轮播
  useEffect(() => {
    if (max <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [max, next]);

  return (
    <div>
      <div className="flex items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
            Featured
          </p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
            头条
          </h2>
        </div>
        <Link
          href="/articles"
          className="shrink-0 text-[15px] font-medium text-[var(--accent)] transition duration-200 hover:opacity-75"
        >
          浏览全部
        </Link>
      </div>

      <div className="relative mt-10">
        {/* 滑动轨道 */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {items.map((a, index) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group relative min-w-full shrink-0"
              >
                <div className="relative aspect-[21/9] overflow-hidden bg-black md:aspect-[24/9]">
                  {a.coverImage ? (
                    <Image
                      src={a.coverImage}
                      alt=""
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
                      priority={index === 0}
                      sizes="100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d2f] to-[#1d1d1f]" />
                  )}
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* 文字 */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14">
                    <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                      {a.category ?? "资讯"}
                    </span>
                    <h3 className="mt-3 text-[1.5rem] font-semibold leading-tight tracking-tight text-white md:text-[2rem] lg:text-[2.25rem]">
                      {a.title}
                    </h3>
                    {a.summary ? (
                      <p className="mt-3 line-clamp-2 max-w-[40rem] text-[15px] text-white/75 md:text-base">
                        {a.summary}
                      </p>
                    ) : null}
                    <p className="mt-4 text-[13px] text-white/50">
                      {formatDateZh(a.publishedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 控制按钮 — AWS 风格圆箭头 */}
        {max > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
              aria-label="上一张"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 4L6 10L12 16"
                  stroke="#1d1d1f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={current === max - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
              aria-label="下一张"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M8 4L14 10L8 16"
                  stroke="#1d1d1f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* 指示点 */}
        {max > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-8 bg-[var(--accent)]"
                    : "w-2 bg-black/15 hover:bg-black/30"
                }`}
                aria-label={`切换到第 ${i + 1} 张`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
