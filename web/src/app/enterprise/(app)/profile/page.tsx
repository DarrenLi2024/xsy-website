import { getEnterpriseUser } from "@/lib/enterprise-auth";
import PageHeader from "@/components/admin/page-header";
import CompanyProfileForm from "@/components/enterprise/forms/company-profile-form";

export const dynamic = "force-dynamic";

export default async function EnterpriseProfilePage() {
  const user = await getEnterpriseUser();
  if (!user || !user.companyId || !user.company) {
    return (
      <div>
        <PageHeader title="企业资料" description="您的账号尚未关联企业" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="企业资料" description="编辑您的企业信息，这些信息将展示在企业主页上。" />
      <CompanyProfileForm company={user.company} />
    </div>
  );
}
