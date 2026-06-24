import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { safeQuery } from "@/lib/data/safe-query";
import ArticlesPageClient from "./articles-client";

export const metadata: Metadata = {
  title: "资讯",
  description: "半导体产业深度文章与动态。",
};

export const revalidate = 60;

export default async function ArticlesPage() {
  const articles = await getCachedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))] as string[];

  return <ArticlesPageClient articles={articles} categories={categories} />;
}

/** 文章列表 — ISR 缓存 120 秒 */
const getCachedArticles = unstable_cache(
  async () =>
    safeQuery(
      () =>
        prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take: 50,
          select: {
            id: true, slug: true, title: true, summary: true,
            coverImage: true, category: true, publishedAt: true,
          },
        }),
      [],
      "articles-page",
    ),
  ["articles-page-v1"],
  { revalidate: 120, tags: ["home"] },
);
