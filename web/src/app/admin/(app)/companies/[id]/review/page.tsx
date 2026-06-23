import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import { CompanyReviewForm } from "@/components/admin/forms/company-form";

export const dynamic = "force-dynamic";

export default async function CompanyReviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const user = await getAdminUser();
  if (!user) return null;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company || company.deletedAt) notFound();

  return (
    <div>
      <PageHeader title={`审核企业: ${company.name}`} description="查看企业信息后审核通过或驳回" />
      <CompanyReviewForm
        company={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo: company.logo || "",
          description: company.description || "",
          website: company.website || "",
          industry: company.industry || "",
          scale: company.scale || "",
          city: company.city || "",
          status: company.status,
        }}
      />
    </div>
  );
}
