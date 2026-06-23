import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, EventStatus } from "@prisma/client";
import { getActivePublicPageSectionsMap, type PublicSectionCode } from "./page-sections";
import { safeQuery } from "./safe-query";

const HOME_SECTION_CODES = [
  "trending",
  "articles-feed",
  "companies",
  "events",
  "reports",
  "awards",
  "hero",
  "topics",
  "testimonials",
  "cta",
] as const satisfies readonly PublicSectionCode[];

const emptyStats = { companiesCount: 0, articlesCount: 0, eventsCount: 0 };

async function fetchHomeStats() {
  const [companiesCount, articlesCount, eventsCount] = await Promise.all([
    prisma.company.count({ where: { status: CompanyStatus.APPROVED, deletedAt: null } }),
    prisma.article.count({
      where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
    }),
    prisma.event.count({
      where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] } },
    }),
  ]);
  return { companiesCount, articlesCount, eventsCount };
}

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImage: true,
  category: true,
  publishedAt: true,
  isFeatured: true,
} as const;

export async function getHomePageData() {
  const now = new Date();

  const [sectionMap, stats] = await Promise.all([
    safeQuery(
      () => getActivePublicPageSectionsMap(HOME_SECTION_CODES),
      new Map<PublicSectionCode, never>(),
      "home-sections",
    ),
    safeQuery(() => fetchHomeStats(), emptyStats, "home-stats"),
  ]);

  const trendingSection = sectionMap.get("trending") ?? null;
  const feedSection = sectionMap.get("articles-feed") ?? null;
  const companiesSection = sectionMap.get("companies") ?? null;
  const eventsSection = sectionMap.get("events") ?? null;
  const reportsSection = sectionMap.get("reports") ?? null;
  const awardsSection = sectionMap.get("awards") ?? null;
  const heroSection = sectionMap.get("hero") ?? null;
  const topicsSection = sectionMap.get("topics") ?? null;
  const testimonialsSection = sectionMap.get("testimonials") ?? null;
  const ctaSection = sectionMap.get("cta") ?? null;

  const needArticles = Boolean(feedSection || trendingSection);

  const [articlePool, companies, events, award, reports, ad] = await Promise.all([
    needArticles
      ? safeQuery(
          () =>
            prisma.article.findMany({
              where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
              orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
              take: 12,
              select: articleSelect,
            }),
          [],
          "home-articles",
        )
      : Promise.resolve([]),
    companiesSection
      ? safeQuery(
          () =>
            prisma.company.findMany({
              where: { status: CompanyStatus.APPROVED, deletedAt: null },
              orderBy: { updatedAt: "desc" },
              take: 8,
              select: {
                slug: true,
                name: true,
                logo: true,
                industry: true,
                city: true,
                description: true,
              },
            }),
          [],
          "home-companies",
        )
      : Promise.resolve([]),
    eventsSection
      ? safeQuery(
          () =>
            prisma.event.findMany({
              where: {
                status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] },
                endDate: { gte: now },
              },
              orderBy: { startDate: "asc" },
              take: 9,
              select: {
                id: true,
                title: true,
                type: true,
                startDate: true,
                endDate: true,
                location: true,
                coverImage: true,
              },
            }),
          [],
          "home-events",
        )
      : Promise.resolve([]),
    awardsSection
      ? safeQuery(
          () =>
            prisma.awardCampaign.findFirst({
              where: { active: true },
              orderBy: { year: "desc" },
            }),
          null,
          "home-award",
        )
      : Promise.resolve(null),
    reportsSection
      ? safeQuery(
          () =>
            prisma.report.findMany({
              where: { publishedAt: { not: null } },
              orderBy: { publishedAt: "desc" },
              take: 3,
              select: { id: true, title: true, description: true, category: true, price: true },
            }),
          [],
          "home-reports",
        )
      : Promise.resolve([]),
    safeQuery(
      () =>
        prisma.ad.findFirst({
          where: {
            active: true,
            startDate: { lte: now },
            endDate: { gte: now },
            slot: { code: "home_hero_banner" },
          },
          orderBy: { sort: "asc" },
          include: { slot: true },
        }),
      null,
      "home-ad",
    ),
  ]);

  const featuredArticles = articlePool.filter((a) => a.isFeatured).slice(0, 4);
  const latestArticles = feedSection ? articlePool.slice(0, 8) : [];
  const pool = [
    ...featuredArticles,
    ...articlePool.filter((a) => !featuredArticles.some((f) => f.id === a.id)),
  ];
  const trendingMain = trendingSection && pool.length > 0 ? pool[0] : null;
  const trendingSide = trendingSection ? pool.slice(1, 4) : [];

  return {
    stats,
    featuredArticles: featuredArticles.map(stripFeatured),
    latestArticles: latestArticles.map(stripFeatured),
    trendingMain: trendingMain ? stripFeatured(trendingMain) : null,
    trendingSide: trendingSide.map(stripFeatured),
    companies,
    events,
    award,
    reports,
    ad,
    heroSlides: heroSection?.items ?? [],
    topicItems: topicsSection?.items ?? [],
    testimonialItems: testimonialsSection?.items ?? [],
    ctaItems: ctaSection?.items ?? [],
  };
}

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
  isFeatured: boolean;
};

function stripFeatured(a: ArticleRow) {
  const { isFeatured: _, ...rest } = a;
  return rest;
}

export type HomePagePayload = Awaited<ReturnType<typeof getHomePageData>>;

export const emptyHomePayload: HomePagePayload = {
  stats: emptyStats,
  featuredArticles: [],
  latestArticles: [],
  trendingMain: null,
  trendingSide: [],
  companies: [],
  events: [],
  award: null,
  reports: [],
  ad: null,
  heroSlides: [],
  topicItems: [],
  testimonialItems: [],
  ctaItems: [],
};

/** 疑似 DB 瞬态失败：不把空壳数据写入 ISR 缓存 */
function looksLikeTransientEmpty(data: HomePagePayload): boolean {
  return (
    data.heroSlides.length === 0 &&
    data.stats.companiesCount === 0 &&
    data.stats.articlesCount === 0 &&
    data.latestArticles.length === 0 &&
    data.companies.length === 0
  );
}

const getCachedHomePageData = unstable_cache(
  async () => {
    const data = await getHomePageData();
    if (looksLikeTransientEmpty(data)) {
      throw new Error("Home page transient empty — skip cache");
    }
    return data;
  },
  ["home-page-data-v2"],
  { revalidate: 60, tags: ["home"] },
);

export async function getHomePageDataSafe(): Promise<HomePagePayload> {
  try {
    return await getCachedHomePageData();
  } catch (err) {
    console.error("[getHomePageDataSafe:cache]", err);
  }

  try {
    const fresh = await getHomePageData();
    if (!looksLikeTransientEmpty(fresh)) return fresh;
  } catch (err) {
    console.error("[getHomePageDataSafe:fresh]", err);
  }

  return emptyHomePayload;
}
