import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, JobStatus } from "@prisma/client";
import { safeQuery } from "./safe-query";

/** 同请求内 generateMetadata 与页面组件共享查询 */
export const getPublishedArticleBySlug = cache(async (slug: string) =>
  safeQuery(
    () =>
      prisma.article.findFirst({
        where: { slug, status: ArticleStatus.PUBLISHED, deletedAt: null },
        include: { company: { select: { name: true, slug: true } } },
      }),
    null,
    "public-article",
  ),
);

export const getApprovedCompanyBySlug = cache(async (slug: string) =>
  safeQuery(
    () =>
      prisma.company.findFirst({
        where: { slug, status: CompanyStatus.APPROVED, deletedAt: null },
        include: {
          products: { orderBy: { sort: "asc" }, take: 12 },
          articles: {
            where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
            orderBy: { publishedAt: "desc" },
            take: 6,
            select: { slug: true, title: true, publishedAt: true },
          },
          jobs: {
            where: { status: JobStatus.PUBLISHED },
            orderBy: { createdAt: "desc" },
            take: 8,
          },
        },
      }),
    null,
    "public-company",
  ),
);

export const getEventById = cache(async (id: string) =>
  safeQuery(
    () =>
      prisma.event.findUnique({
        where: { id },
        include: { company: { select: { name: true, slug: true } } },
      }),
    null,
    "public-event",
  ),
);

export const getPublishedJobById = cache(async (id: string) =>
  safeQuery(
    () =>
      prisma.job.findFirst({
        where: { id, status: "PUBLISHED" },
        include: { company: { select: { name: true, slug: true } } },
      }),
    null,
    "public-job",
  ),
);

export const getReportById = cache(async (id: string) =>
  safeQuery(
    () => prisma.report.findUnique({ where: { id } }),
    null,
    "public-report",
  ),
);

export const getAwardCampaignBySlug = cache(async (slug: string) =>
  safeQuery(
    () =>
      prisma.awardCampaign.findUnique({
        where: { slug },
        include: { _count: { select: { votes: true } } },
      }),
    null,
    "public-award",
  ),
);
