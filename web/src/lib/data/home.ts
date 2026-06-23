import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, EventStatus } from "@prisma/client";
import { getActivePublicPageSectionsMap, type PublicSectionCode } from "./page-sections";

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

export async function getHomePageData() {
  const now = new Date();

  const [sectionMap, stats] = await Promise.all([
    getActivePublicPageSectionsMap(HOME_SECTION_CODES),
    Promise.all([
      prisma.company.count({ where: { status: CompanyStatus.APPROVED, deletedAt: null } }),
      prisma.article.count({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
      }),
      prisma.event.count({
        where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] } },
      }),
    ]).then(([companiesCount, articlesCount, eventsCount]) => ({
      companiesCount,
      articlesCount,
      eventsCount,
    })),
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

  const [
    featuredArticles,
    latestArticles,
    companies,
    events,
    award,
    reports,
    ad,
  ] = await Promise.all([
    feedSection || trendingSection
      ? prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null, isFeatured: true },
          orderBy: { publishedAt: "desc" },
          take: 4,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            coverImage: true,
            category: true,
            publishedAt: true,
          },
        })
      : Promise.resolve([]),
    feedSection
      ? prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take: 8,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            coverImage: true,
            category: true,
            publishedAt: true,
          },
        })
      : Promise.resolve([]),
    companiesSection
      ? prisma.company.findMany({
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
        })
      : Promise.resolve([]),
    eventsSection
      ? prisma.event.findMany({
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
        })
      : Promise.resolve([]),
    awardsSection
      ? prisma.awardCampaign.findFirst({ where: { active: true }, orderBy: { year: "desc" } })
      : Promise.resolve(null),
    reportsSection
      ? prisma.report.findMany({
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 3,
          select: { id: true, title: true, description: true, category: true, price: true },
        })
      : Promise.resolve([]),
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
  ]);

  const pool = [
    ...featuredArticles,
    ...latestArticles.filter((a) => !featuredArticles.some((f) => f.id === a.id)),
  ];
  const trendingMain = trendingSection && pool.length > 0 ? pool[0] : null;
  const trendingSide = trendingSection ? pool.slice(1, 4) : [];

  return {
    stats,
    featuredArticles,
    latestArticles,
    trendingMain,
    trendingSide,
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

export type HomePagePayload = Awaited<ReturnType<typeof getHomePageData>>;

export const emptyHomePayload: HomePagePayload = {
  stats: { companiesCount: 0, articlesCount: 0, eventsCount: 0 },
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

const getCachedHomePageData = unstable_cache(
  async () => {
    try {
      return await getHomePageData();
    } catch (err) {
      console.error("[getHomePageData]", err);
      return emptyHomePayload;
    }
  },
  ["home-page-data"],
  { revalidate: 60, tags: ["home"] },
);

export async function getHomePageDataSafe(): Promise<HomePagePayload> {
  return getCachedHomePageData();
}
