import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import JobForm from "@/components/admin/forms/job-form";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  });

  if (!job) notFound();

  const typeLabels: Record<string, string> = {
    FULL_TIME: "全职",
    PART_TIME: "兼职",
    INTERNSHIP: "实习",
    CONTRACT: "合同",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title={`编辑: ${job.title}`} />
        <StatusBadge status={job.status} />
      </div>
      <div className="mb-6 text-xs text-slate-500">
        ID: {job.id} · 类型: {typeLabels[job.type] || job.type} · 企业: {job.company?.name || "-"} · 创建于{" "}
        {new Date(job.createdAt).toLocaleDateString("zh-CN")}
      </div>
      <JobForm
        initialData={{
          id: job.id,
          title: job.title,
          city: job.city || "",
          type: job.type,
          experience: job.experience || "",
          education: job.education || "",
          salaryMin: job.salaryMin ?? null,
          salaryMax: job.salaryMax ?? null,
          description: job.description,
          requirements: job.requirements || "",
          status: job.status,
        }}
      />
    </div>
  );
}
