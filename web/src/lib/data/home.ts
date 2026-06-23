import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, EventStatus } from "@prisma/client";
import { getPublicPageSection } from "./page-sections";

const HOME_QUERY_TIMEOUT_MS = 1800;
const DB_RETRY_COOLDOWN_MS = 30000;
let dbRetryAfter = 0;

export async function getHomePageData() {
  const now = new Date();

  // 先获取所有板块的 active 状态
  const [
    trendingSection,
    feedSection,
    companiesSection,
    eventsSection,
    reportsSection,
    awardsSection,
    heroSection,
    topicsSection,
    testimonialsSection,
    ctaSection,
  ] = await Promise.all([
    getPublicPageSection("trending"),
    getPublicPageSection("articles-feed"),
    getPublicPageSection("companies"),
    getPublicPageSection("events"),
    getPublicPageSection("reports"),
    getPublicPageSection("awards"),
    getPublicPageSection("hero"),
    getPublicPageSection("topics"),
    getPublicPageSection("testimonials"),
    getPublicPageSection("cta"),
  ]);

  // Stats always fetch
  const stats = await Promise.all([
    prisma.company.count({ where: { status: CompanyStatus.APPROVED, deletedAt: null } }),
    prisma.article.count({
      where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
    }),
    prisma.event.count({ where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] } } }),
  ]).then(([companiesCount, articlesCount, eventsCount]) => ({
    companiesCount,
    articlesCount,
    eventsCount,
  }));

  // 根据板块 active 状态决定是否查询数据
  const [
    featuredArticles,
    latestArticles,
    companies,
    events,
    award,
    reports,
    ad,
  ] = await Promise.all([
    // Featured articles (always shown if articles-feed is active, needed for trending too)
    feedSection || trendingSection
      ? prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null, isFeatured: true },
          orderBy: { publishedAt: "desc" },
          take: 4,
          select: {
            id: true, slug: true, title: true, summary: true, coverImage: true, category: true, publishedAt: true,
          },
        })
      : Promise.resolve([]),
    // Latest articles
    feedSection
      ? prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take: 8,
          select: {
            id: true, slug: true, title: true, summary: true, coverImage: true, category: true, publishedAt: true,
          },
        })
      : Promise.resolve([]),
    // Companies
    companiesSection
      ? prisma.company.findMany({
          where: { status: CompanyStatus.APPROVED, deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 8,
          select: { slug: true, name: true, logo: true, industry: true, city: true, description: true },
        })
      : Promise.resolve([]),
    // Events
    eventsSection
      ? prisma.event.findMany({
          where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] }, endDate: { gte: now } },
          orderBy: { startDate: "asc" },
          take: 9,
          select: { id: true, title: true, type: true, startDate: true, endDate: true, location: true, coverImage: true },
        })
      : Promise.resolve([]),
    // Award
    awardsSection
      ? prisma.awardCampaign.findFirst({ where: { active: true }, orderBy: { year: "desc" } })
      : Promise.resolve(null),
    // Reports
    reportsSection
      ? prisma.report.findMany({
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 3,
          select: { id: true, title: true, description: true, category: true, price: true },
        })
      : Promise.resolve([]),
    // Ad
    prisma.ad.findFirst({
      where: { active: true, startDate: { lte: now }, endDate: { gte: now }, slot: { code: "home_hero_banner" } },
      orderBy: { sort: "asc" },
      include: { slot: true },
    }),
  ]);

  const pool = [
    ...featuredArticles,
    ...latestArticles.filter(
      (a) => !featuredArticles.some((f) => f.id === a.id),
    ),
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

export async function getHomePageDataSafe(): Promise<HomePagePayload> {
  const now = Date.now();
  if (now < dbRetryAfter) {
    return emptyHomePayload;
  }

  try {
    const data = await Promise.race([
      getHomePageData(),
      new Promise<HomePagePayload>((_, reject) =>
        setTimeout(() => reject(new Error("home-data-timeout")), HOME_QUERY_TIMEOUT_MS),
      ),
    ]);
    dbRetryAfter = 0;
    return data;
  } catch (err) {
    console.error("[getHomePageData]", err);
    dbRetryAfter = Date.now() + DB_RETRY_COOLDOWN_MS;
    return emptyHomePayload;
  }
}
