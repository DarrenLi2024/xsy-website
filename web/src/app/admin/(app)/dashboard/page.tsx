import { getAdminDashboardStats } from "@/lib/data/admin-dashboard";
import StatsCard from "@/components/admin/stats-card";
import {
  ArticleTrendChart,
  CompanyTrendChart,
  IndustryDistributionChart,
  ContentStatusChart,
} from "@/components/admin/charts";
import Link from "next/link";

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const {
    totalArticles,
    totalCompanies,
    pendingCompanies,
    draftArticles,
    pendingReviewArticles,
    totalEvents,
    totalReports,
    totalUsers,
    totalJobs,
    totalAds,
    monthArticles,
  } = await getAdminDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">运营控制台</h1>
        <p className="mt-1 text-sm text-slate-400">数据概览与待办事项</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="文章总数" value={totalArticles} trend={{ value: `本月 ${monthArticles} 篇`, positive: true }} />
        <StatsCard label="企业总数" value={totalCompanies} />
        <StatsCard label="活动中" value={totalEvents} />
        <StatsCard label="注册用户" value={totalUsers} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="待审核企业" value={pendingCompanies} />
        <StatsCard label="草稿文章" value={draftArticles} />
        <StatsCard label="待审文章" value={pendingReviewArticles} />
        <StatsCard label="活跃职位" value={totalJobs} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatsCard label="报告数量" value={totalReports} />
        <StatsCard label="活跃广告" value={totalAds} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ArticleTrendChart />
        <CompanyTrendChart />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <IndustryDistributionChart />
        <ContentStatusChart />
      </div>

      {(pendingCompanies > 0 || pendingReviewArticles > 0) && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">待处理事项</h2>
          <div className="space-y-3">
            {pendingCompanies > 0 && (
              <Link
                href="/admin/companies"
                className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3 transition-colors hover:bg-yellow-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-sm font-bold text-yellow-400">
                  {pendingCompanies}
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-300">待审核企业入驻</p>
                  <p className="text-xs text-slate-500">点击查看企业审核列表</p>
                </div>
              </Link>
            )}
            {pendingReviewArticles > 0 && (
              <Link
                href="/admin/articles"
                className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-3 transition-colors hover:bg-blue-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">
                  {pendingReviewArticles}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-300">待审文章</p>
                  <p className="text-xs text-slate-500">点击查看文章审核列表</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            发布文章
          </Link>
          <Link
            href="/admin/events/new"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            创建活动
          </Link>
          <Link
            href="/admin/companies"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            企业管理
          </Link>
        </div>
      </div>
    </div>
  );
}
