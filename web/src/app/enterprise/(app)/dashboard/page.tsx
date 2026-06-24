import { getEnterpriseUser } from "@/lib/enterprise-auth";
import { prisma } from "@/lib/prisma";
import StatsCard from "@/components/admin/stats-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EnterpriseDashboardPage() {
  const user = await getEnterpriseUser();
  if (!user) return null;

  const companyId = user.companyId;
  const company = user.company;

  let products = 0, jobs = 0, articles = 0, events = 0;
  if (companyId) {
    [products, jobs, articles, events] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: "PUBLISHED" } }),
      prisma.article.count({ where: { companyId, deletedAt: null } }),
      prisma.event.count({ where: { companyId } }),
    ]);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">控制台</h1>
        <p className="mt-1 text-sm text-slate-400">
          欢迎回来，{user.name || user.email}
          {company && <span className="text-cyan-400"> · {company.name}</span>}
        </p>
      </div>

      {!companyId ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <p className="text-yellow-300 text-sm font-medium">您的账号尚未关联企业</p>
          <p className="mt-1 text-xs text-slate-500">请联系运营团队完成企业入驻。</p>
        </div>
      ) : (
        <>
          {company?.status === "PENDING" && (
            <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <p className="text-yellow-300 text-sm font-medium">企业入驻审核中</p>
              <p className="mt-1 text-xs text-slate-500">您的企业「{company.name}」正在等待管理员审核。</p>
            </div>
          )}
          {company?.status === "REJECTED" && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-red-400 text-sm font-medium">入驻申请被驳回</p>
              <p className="mt-1 text-xs text-slate-500">请联系运营团队了解原因。</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="产品数量" value={products} />
            <StatsCard label="活跃职位" value={jobs} />
            <StatsCard label="关联文章" value={articles} />
            <StatsCard label="参与活动" value={events} />
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">快捷操作</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/enterprise/profile" className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors">编辑企业资料</Link>
              <Link href="/enterprise/products/new" className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">添加产品</Link>
              <Link href="/enterprise/jobs/new" className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">发布职位</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
