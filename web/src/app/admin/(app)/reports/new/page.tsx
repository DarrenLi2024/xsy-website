import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import ReportForm from "@/components/admin/forms/report-form";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const user = await getAdminUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="新建报告" description="上传一份新的行业报告" />
      <ReportForm />
    </div>
  );
}
