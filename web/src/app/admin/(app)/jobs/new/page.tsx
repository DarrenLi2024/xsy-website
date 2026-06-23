import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import JobForm from "@/components/admin/forms/job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const user = await getAdminUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="新建职位" description="发布新的招聘职位" />
      <JobForm />
    </div>
  );
}
