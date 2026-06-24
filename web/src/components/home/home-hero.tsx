"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  stats: HomePagePayload["stats"];
  slides: HomePagePayload["heroSlides"];
};

export function HomeHero({ stats, slides }: Props) {
  const [current, setCurrent] = useState(0);
  const hasSlides = slides.length > 0;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [slides.length, next]);

  if (!hasSlides) return null;

  const slide = slides[current];

  return (
    <section id="section-hero" className="relative overflow-hidden bg-black">
      {/* Background image carousel */}
      {hasSlides && slide.image ? (
        <div className="absolute inset-0 transition-opacity duration-700">
          <Image
            src={slide.image}
            alt={slide.subtitle || ""}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        </div>
      ) : null}
      {/* Overlay — 左侧压暗保文字可读 */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/28 to-black/5 md:from-black/52 md:via-black/14"
        aria-hidden
      />
      {/* 底部深色多彩渐变，替代原先过曝的白色蒙板 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#050810] via-[#0c1222]/82 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-cyan-950/45 via-indigo-950/28 to-transparent mix-blend-soft-light"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-violet-950/30 via-transparent to-transparent"
        aria-hidden
      />
      {/* 与下方统计栏的极短衔接，避免硬切 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f5f5f7] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(88svh,920px)] max-w-[1200px] flex-col justify-end px-5 pb-10 pt-28 md:justify-center md:px-10 md:pb-16 md:pt-20 lg:px-12">
        <div className="xe-animate-in max-w-[34rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75 md:text-xs">
            {slide?.subtitle || "Editorial · Semiconductor"}
          </p>
          <h1 className="mt-5 text-[2.125rem] font-semibold leading-[1.12] tracking-[-0.02em] text-white md:text-5xl lg:text-[3.25rem]">
            {slide?.title || "把复杂产业链，讲成可被信任的故事。"}
          </h1>
          {slide?.description ? (
            <p className="mt-6 text-[1.0625rem] font-normal leading-relaxed text-white/88 md:text-lg md:leading-[1.65]">
              {slide.description}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {slide?.link ? (
              <Link
                href={slide.link}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 text-[17px] font-medium text-[#1d1d1f] transition duration-200 ease-out hover:bg-white/92 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {slide.linkText || "进入资讯"}
              </Link>
            ) : (
              <Link
                href="/articles"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 text-[17px] font-medium text-[#1d1d1f] transition duration-200 ease-out hover:bg-white/92 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                进入资讯
              </Link>
            )}
            <Link
              href="/enterprise/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/45 bg-white/0 px-8 text-[17px] font-medium text-white transition duration-200 ease-out hover:bg-white/12 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              企业合作
            </Link>
          </div>

          {/* Carousel indicators */}
          {slides.length > 1 && (
            <div className="mt-8 flex gap-2">
              {slides.map((_slide: unknown, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === current
                      ? "w-8 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`切换到第 ${i + 1} 张`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative border-t border-black/[0.06] bg-[#f5f5f7]">
        <dl className="mx-auto grid max-w-[1200px] grid-cols-3 divide-x divide-black/[0.06] px-5 py-10 md:px-10 lg:px-12">
          <div className="px-3 text-center md:px-6">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
              入驻企业
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#1d1d1f] md:text-[2rem]">
              {stats.companiesCount}
              <span className="text-2xl font-semibold text-[#6e6e73]">+</span>
            </dd>
          </div>
          <div className="px-3 text-center md:px-6">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
              深度文章
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#1d1d1f] md:text-[2rem]">
              {stats.articlesCount}
              <span className="text-2xl font-semibold text-[#6e6e73]">+</span>
            </dd>
          </div>
          <div className="px-3 text-center md:px-6">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6e6e73]">
              近期活动
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#1d1d1f] md:text-[2rem]">
              {stats.eventsCount}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
