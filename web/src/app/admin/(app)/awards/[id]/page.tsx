import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import AwardForm from "@/components/admin/forms/award-form";

export const dynamic = "force-dynamic";

export default async function EditAwardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const award = await prisma.awardCampaign.findUnique({ where: { id } });
  if (!award) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title={`编辑: ${award.title}`} />
        {award.active ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            进行中
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            已结束
          </span>
        )}
      </div>
      <div className="mb-6 text-xs text-slate-500">
        ID: {award.id} · Slug: {award.slug} · 年份: {award.year} · 创建于{" "}
        {new Date(award.createdAt).toLocaleDateString("zh-CN")}
      </div>
      <AwardForm
        initialData={{
          id: award.id,
          slug: award.slug,
          title: award.title,
          summary: award.summary || "",
          year: award.year,
          startDate: award.startDate.toISOString(),
          endDate: award.endDate.toISOString(),
          active: award.active,
        }}
      />
    </div>
  );
}
