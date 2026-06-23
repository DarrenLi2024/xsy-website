import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, EventStatus, JobStatus } from "@prisma/client";

export const getPublicCompaniesList = unstable_cache(
  async () =>
    prisma.company.findMany({
      where: { status: CompanyStatus.APPROVED, deletedAt: null },
      orderBy: { name: "asc" },
      take: 200,
      select: {
        slug: true,
        name: true,
        logo: true,
        industry: true,
        city: true,
        description: true,
      },
    }),
  ["public-companies-list"],
  { revalidate: 120, tags: ["home"] },
);

export const getPublicEventsList = unstable_cache(
  async () =>
    prisma.event.findMany({
      where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] } },
      orderBy: { startDate: "asc" },
      take: 40,
      select: {
        id: true,
        title: true,
        type: true,
        startDate: true,
        location: true,
        coverImage: true,
      },
    }),
  ["public-events-list"],
  { revalidate: 120, tags: ["home"] },
);

export const getPublicJobsList = unstable_cache(
  async () =>
    prisma.job.findMany({
      where: { status: JobStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        city: true,
        type: true,
        company: { select: { name: true, slug: true } },
      },
    }),
  ["public-jobs-list"],
  { revalidate: 120, tags: ["home"] },
);

export const getPublicArticlesList = unstable_cache(
  async () =>
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 30,
      select: {
        slug: true,
        title: true,
        summary: true,
        category: true,
        coverImage: true,
        publishedAt: true,
        author: true,
      },
    }),
  ["public-articles-list"],
  { revalidate: 120, tags: ["home"] },
);
