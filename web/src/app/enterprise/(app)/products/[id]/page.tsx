import { getEnterpriseUser } from "@/lib/enterprise-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/enterprise/forms/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getEnterpriseUser();
  if (!user || !user.companyId) return null;

  const product = await prisma.product.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!product) notFound();

  return (
    <div>
      <PageHeader title={`编辑: ${product.name}`} description="修改产品信息" />
      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          parameters: product.parameters ? JSON.stringify(product.parameters) : "",
          datasheetUrl: product.datasheetUrl,
        }}
      />
    </div>
  );
}
