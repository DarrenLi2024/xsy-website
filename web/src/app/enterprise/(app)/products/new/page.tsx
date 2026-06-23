import { getEnterpriseUser } from "@/lib/enterprise-auth";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/enterprise/forms/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await getEnterpriseUser();
  return (
    <div>
      <PageHeader title="新建产品" description="添加一款新的产品到企业产品目录。" />
      <ProductForm />
    </div>
  );
}
