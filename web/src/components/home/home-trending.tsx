import Link from "next/link";
import Image from "next/image";
import { formatDateZh } from "@/lib/format-date";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  trendingMain: HomePagePayload["trendingMain"];
  trendingSide: HomePagePayload["trendingSide"];
};

export function HomeTrending({ trendingMain, trendingSide }: Props) {
  if (!trendingMain) return null;

  return (
    <section id="section-trending" className="scroll-mt-32 bg-[#fbfbfd] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
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
            全部文章
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <Link
            href={`/articles/${trendingMain.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:col-span-7"
          >
            <div className="relative aspect-[16/10] w-full bg-[#f5f5f7]">
              {trendingMain.coverImage ? (
                <Image
                  src={trendingMain.coverImage}
                  alt=""
                  fill
                  className="object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                  sizes="(max-width:1024px) 100vw, 58vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />
              )}
            </div>
            <div className="p-6 md:p-8">
              {trendingMain.category ? (
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
                  {trendingMain.category}
                </span>
              ) : null}
              <h3 className="mt-3 text-[1.5rem] font-semibold leading-snug tracking-tight text-[#1d1d1f] md:text-[1.75rem]">
                {trendingMain.title}
              </h3>
              {trendingMain.summary ? (
                <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-[#6e6e73]">
                  {trendingMain.summary}
                </p>
              ) : null}
              <p className="mt-5 text-[12px] text-[#86868b]">{formatDateZh(trendingMain.publishedAt)}</p>
            </div>
          </Link>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {trendingSide.map((item) => (
              <Link
                key={item.id}
                href={`/articles/${item.slug}`}
                className="group flex gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="relative h-[5.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-xl bg-[#f5f5f7]">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                      sizes="120px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-[#1d1d1f] transition group-hover:text-[#000]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[12px] text-[#86868b]">
                    {item.category ?? "资讯"} · {formatDateZh(item.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
