import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import CompanyForm from "@/components/admin/forms/company-form";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const user = await getAdminUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="新建企业" description="添加一家新的半导体企业" />
      <CompanyForm />
    </div>
  );
}
