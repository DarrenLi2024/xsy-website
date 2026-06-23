import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import CompanyForm from "@/components/admin/forms/company-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!company || company.deletedAt) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-slate-400">企业不存在或已删除</p>
          <Link
            href="/admin/companies"
            className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            返回企业列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        description={`${company.industry || "未分类"} · ${company.city || "未知城市"} · ${company._count.products} 个产品 · 创建于 ${new Date(company.createdAt).toLocaleDateString("zh-CN")}`}
        actions={
          <Link
            href="/admin/companies"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            返回列表
          </Link>
        }
      />

      <CompanyForm
        initialData={{
          id: company.id,
          name: company.name,
          logo: company.logo,
          description: company.description,
          website: company.website,
          industry: company.industry,
          scale: company.scale,
          city: company.city,
          status: company.status,
        }}
      />
    </div>
  );
}
