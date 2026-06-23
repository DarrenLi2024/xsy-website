import { getEnterpriseUser } from "@/lib/enterprise-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import JobForm from "@/components/enterprise/forms/job-form";

export const dynamic = "force-dynamic";

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getEnterpriseUser();
  if (!user || !user.companyId) return null;

  const job = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!job) notFound();

  return (
    <div>
      <PageHeader title={`编辑: ${job.title}`} description="修改职位信息" />
      <JobForm
        initialData={{
          id: job.id,
          title: job.title,
          city: job.city,
          type: job.type,
          experience: job.experience,
          education: job.education,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          description: job.description,
          requirements: job.requirements,
          status: job.status,
        }}
      />
    </div>
  );
}
