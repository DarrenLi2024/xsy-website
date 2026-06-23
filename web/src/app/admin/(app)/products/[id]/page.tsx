import { prisma } from "@/lib/prisma";
import { getAdminCompanyOptions } from "@/lib/data/admin-companies";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/admin/forms/product-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const [product, companies] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } } },
    }),
    getAdminCompanyOptions(),
  ]);

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-slate-400">产品不存在</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            返回产品列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`${product.company.name} · ${product.category || "未分类"}`}
        actions={
          <Link
            href="/admin/products"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            返回列表
          </Link>
        }
      />

      <ProductForm
        companies={companies}
        initialData={{
          id: product.id,
          companyId: product.companyId,
          name: product.name,
          category: product.category,
          description: product.description,
          status: product.status,
          sort: product.sort,
        }}
      />
    </div>
  );
}
