import { getEnterpriseUser } from "@/lib/enterprise-auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import CompanyProfileForm from "@/components/enterprise/forms/company-profile-form";

export const dynamic = "force-dynamic";

export default async function EnterpriseProfilePage() {
  const user = await getEnterpriseUser();
  if (!user || !user.companyId) {
    return (
      <div>
        <PageHeader title="企业资料" description="您的账号尚未关联企业" />
      </div>
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
  });
  if (!company) {
    return (
      <div>
        <PageHeader title="企业资料" description="企业信息未找到" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="企业资料" description="编辑您的企业信息，这些信息将展示在企业主页上。" />
      <CompanyProfileForm company={company} />
    </div>
  );
}
