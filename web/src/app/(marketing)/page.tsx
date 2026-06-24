import { Suspense } from "react";
import { HomeAdBanner } from "@/components/home/home-ad-banner";
import { HomeAwards } from "@/components/home/home-awards";
import { HomeCompanies } from "@/components/home/home-companies";
import { HomeCta } from "@/components/home/home-cta";
import { HomeEvents } from "@/components/home/home-events";
import { HomeFeed } from "@/components/home/home-feed";
import { HomeHero } from "@/components/home/home-hero";
import { HomeProof } from "@/components/home/home-proof";
import { HomeReports } from "@/components/home/home-reports";
import { HomeStickySubNav } from "@/components/home/home-sticky-subnav";
import { HomeTopics } from "@/components/home/home-topics";
import { HomeTrending } from "@/components/home/home-trending";
import {
  getHomeHeroData,
  getHomeStats,
  getHomeAd,
  getHomeTrending,
  getHomeFeed,
  getHomeCompanies,
  getHomeEvents,
  getHomeReports,
  getHomeAwards,
} from "@/lib/data/home";
import { getActivePublicPageSectionsMap } from "@/lib/data/page-sections";

export const revalidate = 60;
export const maxDuration = 30;

/**
 * 首页 — 流式渲染架构。
 *
 * ┌─────────────────────────────────┐
 * │  Hero + Stats（关键路径，内联）  │ ← 在服务器生成 HTML 时同步返回
 * ├─────────────────────────────────┤
 * │  Trending / Feed / 企业 / ...   │ ← 每个独立 Suspense 边界，流式注入
 * └─────────────────────────────────┘
 *
 * 效果：首帧 HTML 快速交付 Hero + Stats，其余区块按数据就绪顺序渐进渲染。
 */
export default async function HomePage() {
  // 首屏关键数据 — 与 HTML 初始输出同时完成
  const [heroData, stats] = await Promise.all([
    getHomeHeroData(),
    getHomeStats(),
  ]);

  return (
    <>
      <HomeHero stats={stats} slides={heroData.heroSlides} />
      <HomeStickySubNav />
      <Suspense fallback={null}><AdSectionLoader /></Suspense>
      <Suspense fallback={null}><TrendingSectionLoader /></Suspense>
      <Suspense fallback={null}><FeedSectionLoader /></Suspense>
      <Suspense fallback={null}><CompaniesSectionLoader /></Suspense>
      <Suspense fallback={null}><EventsSectionLoader /></Suspense>
      <Suspense fallback={null}><ReportsSectionLoader /></Suspense>
      <Suspense fallback={null}><AwardsSectionLoader /></Suspense>
      <Suspense fallback={null}><TopicsSectionLoader /></Suspense>
      <Suspense fallback={null}><ProofSectionLoader /></Suspense>
      <Suspense fallback={null}><CtaSectionLoader /></Suspense>
    </>
  );
}

/* ───── 独立流式区块加载器 — 每个在 Suspense 内各自 fetch ───── */

async function AdSectionLoader() {
  const ad = await getHomeAd();
  return <HomeAdBanner ad={ad} />;
}

async function TrendingSectionLoader() {
  const data = await getHomeTrending();
  return <HomeTrending trendingMain={data.trendingMain} trendingSide={data.trendingSide} />;
}

async function FeedSectionLoader() {
  const data = await getHomeFeed();
  return <HomeFeed articles={data.latestArticles} featuredArticles={data.featuredArticles} />;
}

async function CompaniesSectionLoader() {
  const companies = await getHomeCompanies();
  return <HomeCompanies companies={companies} />;
}

async function EventsSectionLoader() {
  const events = await getHomeEvents();
  return <HomeEvents events={events} />;
}

async function ReportsSectionLoader() {
  const reports = await getHomeReports();
  return <HomeReports reports={reports} />;
}

async function AwardsSectionLoader() {
  const award = await getHomeAwards();
  return <HomeAwards award={award} />;
}

async function TopicsSectionLoader() {
  const sections = await getActivePublicPageSectionsMap(["topics"] as const);
  const items = sections.get("topics")?.items ?? [];
  return <HomeTopics items={items} />;
}

async function ProofSectionLoader() {
  const sections = await getActivePublicPageSectionsMap(["testimonials"] as const);
  const items = sections.get("testimonials")?.items ?? [];
  return <HomeProof items={items} />;
}

async function CtaSectionLoader() {
  const sections = await getActivePublicPageSectionsMap(["cta"] as const);
  const items = sections.get("cta")?.items ?? [];
  return <HomeCta items={items} />;
}
