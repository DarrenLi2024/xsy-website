import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, CompanyStatus, EventStatus, type Prisma } from "@prisma/client";
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

/* ───── 工具类型与常量 ───── */

const emptyStats = { companiesCount: 0, articlesCount: 0, eventsCount: 0 };

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

/* ───── 独立可复用的区块数据获取 ───── */

/** 首页统计（企业数/文章数/活动数） */
export async function getHomeStats() {
  return safeQuery(
    async () => {
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
    },
    emptyStats,
    "home-stats",
  );
}

export type HomeStats = Awaited<ReturnType<typeof getHomeStats>>;

/** Hero Slides — 从页面板块获取 */
export async function getHomeHeroData() {
  const section = await getActivePublicPageSectionsMap(["hero"] as const);
  return { heroSlides: section.get("hero")?.items ?? [] };
}

export type HomeHeroData = Awaited<ReturnType<typeof getHomeHeroData>>;

/** 广告 */
export async function getHomeAd() {
  return safeQuery(
    () =>
      prisma.ad.findFirst({
        where: {
          active: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          slot: { code: "home_hero_banner" },
        },
        orderBy: { sort: "asc" },
        include: { slot: true },
      }),
    null,
    "home-ad",
  );
}

/** 文章池：供 Trending + Feed 使用 */
async function getHomeArticlePool() {
  return safeQuery(
    () =>
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        take: 12,
        select: articleSelect,
      }),
    [],
    "home-articles",
  );
}

/** Trending 区块 */
export async function getHomeTrending() {
  const pool = await getHomeArticlePool();
  const featured = pool.filter((a) => a.isFeatured).slice(0, 4);
  const reordered = [
    ...featured,
    ...pool.filter((a) => !featured.some((f) => f.id === a.id)),
  ];
  return {
    trendingMain: reordered.length > 0 ? stripFeatured(reordered[0]) : null,
    trendingSide: reordered.slice(1, 4).map(stripFeatured),
  };
}

/** Feed 区块 */
export async function getHomeFeed() {
  const pool = await getHomeArticlePool();
  const featured = pool.filter((a) => a.isFeatured).slice(0, 4);
  const latest = pool.slice(0, 8);
  return {
    featuredArticles: featured.map(stripFeatured),
    latestArticles: latest.map(stripFeatured),
  };
}

/** 企业区块 */
export async function getHomeCompanies() {
  return safeQuery(
    () =>
      prisma.company.findMany({
        where: { status: CompanyStatus.APPROVED, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          slug: true, name: true, logo: true, industry: true, city: true, description: true,
        },
      }),
    [],
    "home-companies",
  );
}

/** 活动区块 */
export async function getHomeEvents() {
  return safeQuery(
    () =>
      prisma.event.findMany({
        where: {
          status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] },
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 9,
        select: { id: true, title: true, type: true, startDate: true, endDate: true, location: true, coverImage: true },
      }),
    [],
    "home-events",
  );
}

/** 报告区块 */
export async function getHomeReports() {
  return safeQuery(
    () =>
      prisma.report.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, title: true, description: true, category: true, price: true },
      }),
    [],
    "home-reports",
  );
}

/** 评选区块 */
export async function getHomeAwards() {
  return safeQuery(
    () =>
      prisma.awardCampaign.findFirst({
        where: { active: true },
        orderBy: { year: "desc" },
      }),
    null,
    "home-award",
  );
}

/** 区块类型的 Props 推断 */
export type HomeAd = Awaited<ReturnType<typeof getHomeAd>>;
export type HomeTrending = Awaited<ReturnType<typeof getHomeTrending>>;
export type HomeFeed = Awaited<ReturnType<typeof getHomeFeed>>;
export type HomeCompanies = Awaited<ReturnType<typeof getHomeCompanies>>;
export type HomeEvents = Awaited<ReturnType<typeof getHomeEvents>>;
export type HomeReports = Awaited<ReturnType<typeof getHomeReports>>;
export type HomeAwards = Awaited<ReturnType<typeof getHomeAwards>>;

/* ───── 旧版兼容：完整首页数据（ISR 缓存） ───── */

async function fetchHomeStats() {
  const [companiesCount, articlesCount, eventsCount] = await Promise.all([
    prisma.company.count({ where: { status: CompanyStatus.APPROVED, deletedAt: null } }),
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED, deletedAt: null } }),
    prisma.event.count({ where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] } } }),
  ]);
  return { companiesCount, articlesCount, eventsCount };
}

export async function getHomePageData() {
  const now = new Date();
  const [sectionMap, stats] = await Promise.all([
    safeQuery(() => getActivePublicPageSectionsMap(HOME_SECTION_CODES), new Map(), "home-sections"),
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
      ? safeQuery(() => prisma.article.findMany({
          where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
          take: 12, select: articleSelect,
        }), [], "home-articles")
      : Promise.resolve([]),
    companiesSection
      ? safeQuery(() => prisma.company.findMany({
          where: { status: CompanyStatus.APPROVED, deletedAt: null },
          orderBy: { updatedAt: "desc" }, take: 8,
          select: { slug: true, name: true, logo: true, industry: true, city: true, description: true },
        }), [], "home-companies")
      : Promise.resolve([]),
    eventsSection
      ? safeQuery(() => prisma.event.findMany({
          where: { status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] }, endDate: { gte: now } },
          orderBy: { startDate: "asc" }, take: 9,
          select: { id: true, title: true, type: true, startDate: true, endDate: true, location: true, coverImage: true },
        }), [], "home-events")
      : Promise.resolve([]),
    awardsSection
      ? safeQuery(() => prisma.awardCampaign.findFirst({
          where: { active: true }, orderBy: { year: "desc" },
        }), null, "home-award")
      : Promise.resolve(null),
    reportsSection
      ? safeQuery(() => prisma.report.findMany({
          where: { publishedAt: { not: null } }, orderBy: { publishedAt: "desc" }, take: 3,
          select: { id: true, title: true, description: true, category: true, price: true },
        }), [], "home-reports")
      : Promise.resolve([]),
    safeQuery(() => prisma.ad.findFirst({
        where: { active: true, startDate: { lte: now }, endDate: { gte: now }, slot: { code: "home_hero_banner" } },
        orderBy: { sort: "asc" }, include: { slot: true },
      }), null, "home-ad"),
  ]);

  const featuredArticles = articlePool.filter((a) => a.isFeatured).slice(0, 4);
  const latestArticles = feedSection ? articlePool.slice(0, 8) : [];
  const pool = [...featuredArticles, ...articlePool.filter((a) => !featuredArticles.some((f) => f.id === a.id))];
  const trendingMain = trendingSection && pool.length > 0 ? pool[0] : null;
  const trendingSide = trendingSection ? pool.slice(1, 4) : [];

  return {
    stats,
    featuredArticles: featuredArticles.map(stripFeatured),
    latestArticles: latestArticles.map(stripFeatured),
    trendingMain: trendingMain ? stripFeatured(trendingMain) : null,
    trendingSide: trendingSide.map(stripFeatured),
    companies, events, award, reports, ad,
    heroSlides: heroSection?.items ?? [],
    topicItems: topicsSection?.items ?? [],
    testimonialItems: testimonialsSection?.items ?? [],
    ctaItems: ctaSection?.items ?? [],
  };
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
