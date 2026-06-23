import PageHeader from "@/components/admin/page-header";
import JobForm from "@/components/admin/forms/job-form";

export default async function NewJobPage() {
  return (
    <div>
      <PageHeader title="新建职位" description="发布新的招聘职位" />
      <JobForm />
    </div>
  );
}
