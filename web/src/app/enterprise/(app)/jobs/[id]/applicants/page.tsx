import { getEnterpriseUser } from "@/lib/enterprise-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JobApplicantsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getEnterpriseUser();
  if (!user || !user.companyId) return null;

  const job = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!job) notFound();

  const applicants = await prisma.jobApplication.findMany({
    where: { jobId: id },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, string> = {
    PENDING: "待处理", REVIEWED: "已查看", INTERVIEWING: "面试中", ACCEPTED: "已录用", REJECTED: "已婉拒",
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/enterprise/jobs" className="text-sm text-cyan-400 hover:underline">&larr; 返回职位列表</Link>
        <h1 className="mt-2 text-2xl font-bold text-white">{job.title} - 应聘者</h1>
        <p className="mt-1 text-sm text-slate-400">共 {applicants.length} 人应聘</p>
      </div>

      {applicants.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">暂无应聘者</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">姓名</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">电话</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">投递时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applicants.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{a.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{a.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                      {statusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {new Date(a.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
