import { getEnterpriseUser } from "@/lib/enterprise-auth";
import PageHeader from "@/components/admin/page-header";
import JobForm from "@/components/enterprise/forms/job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await getEnterpriseUser();
  return (
    <div>
      <PageHeader title="发布职位" description="创建一个新的招聘职位。" />
      <JobForm />
    </div>
  );
}
