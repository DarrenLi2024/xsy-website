import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import ReportForm from "@/components/admin/forms/report-form";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  INDUSTRY_TREND: "行业趋势",
  MARKET_ANALYSIS: "市场分析",
  TECHNOLOGY_REVIEW: "技术评测",
  COMPANY_PROFILE: "企业概况",
  CUSTOM_REPORT: "定制报告",
};

export default async function EditReportPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title={`编辑: ${report.title}`} />
      </div>
      <div className="mb-6 text-xs text-slate-500">
        ID: {report.id} · 分类: {report.category ? categoryLabels[report.category] || report.category : "-"} ·{" "}
        下载量: {report.downloadCount} · 创建于{" "}
        {new Date(report.createdAt).toLocaleDateString("zh-CN")}
      </div>
      <ReportForm
        initialData={{
          id: report.id,
          title: report.title,
          description: report.description || "",
          coverImage: report.coverImage || "",
          fileUrl: report.fileUrl || "",
          price: report.price ?? null,
          category: report.category || "INDUSTRY_TREND",
          tags: report.tags,
        }}
      />
    </div>
  );
}
