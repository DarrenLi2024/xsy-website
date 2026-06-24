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
import { getHomePageDataSafe } from "@/lib/data/home";

export const revalidate = 60;
export const maxDuration = 30;

/**
 * 首页 — 高效 ISR 渲染。
 *
 * 全部数据通过 getHomePageDataSafe() 在 unstable_cache 内
 * 用一组 Promise.all 批量并行获取，避免拆分查询带来的重复 DB 开销。
 * ISR 60s 缓存保证后续访问秒级响应。
 */
export default async function HomePage() {
  const data = await getHomePageDataSafe();

  return (
    <>
      <HomeHero stats={data.stats} slides={data.heroSlides} />
      <HomeStickySubNav />
      <HomeAdBanner ad={data.ad} />
      <HomeTrending trendingMain={data.trendingMain} trendingSide={data.trendingSide} />
      <HomeFeed articles={data.latestArticles} featuredArticles={data.featuredArticles} />
      <HomeCompanies companies={data.companies} />
      <HomeEvents events={data.events} />
      <HomeReports reports={data.reports} />
      <HomeAwards award={data.award} />
      <HomeTopics items={data.topicItems} />
      <HomeProof items={data.testimonialItems} />
      <HomeCta items={data.ctaItems} />
    </>
  );
}
