import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { getPublishedArticleBySlug } from "@/lib/data/public-detail";
import { formatDateZh } from "@/lib/format-date";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "文章未找到" };
  return {
    title: article.title,
    description: article.summary ?? undefined,
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await safeQuery(
    () => getPublishedArticleBySlug(slug),
    null,
    "ArticleDetailPage",
  );

  if (!article) notFound();

  const related = await safeQuery(
    () =>
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          deletedAt: null,
          id: { not: article.id },
          ...(article.category ? { category: article.category } : {}),
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        select: { slug: true, title: true },
      }),
    [] as { slug: string; title: string }[],
    "ArticleDetailRelated",
  );

  return (
    <article className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
        {article.category ?? "资讯"}
      </p>
      <h1 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-tight text-[#1d1d1f] md:text-[2.5rem]">
        {article.title}
      </h1>
      <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#6e6e73]">
        <span>{article.author ?? "芯师爷"}</span>
        <span className="text-[#d2d2d7]" aria-hidden>
          ·
        </span>
        <time>{formatDateZh(article.publishedAt)}</time>
        {article.company ? (
          <>
            <span className="text-[#d2d2d7]" aria-hidden>
              ·
            </span>
            <Link
              href={`/companies/${article.company.slug}`}
              className="font-medium text-[var(--accent)] transition hover:opacity-75"
            >
              {article.company.name}
            </Link>
          </>
        ) : null}
      </div>
      {article.coverImage ? (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-black/[0.06] bg-[#f5f5f7]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width:768px) 100vw, 720px"
          />
        </div>
      ) : null}
      <div className="prose-xin mt-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>
      {related.length > 0 ? (
        <aside className="mt-16 border-t border-black/[0.06] pt-10">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f]">相关阅读</h2>
          <ul className="mt-4 space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/articles/${r.slug}`}
                  className="text-[15px] font-medium text-[var(--accent)] transition hover:opacity-75"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
