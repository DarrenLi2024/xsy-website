import { getAdminCompanyOptions } from "@/lib/data/admin-companies";
import PageHeader from "@/components/admin/page-header";
import ArticleForm from "@/components/admin/forms/article-form";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const companies = await getAdminCompanyOptions();

  return (
    <div>
      <PageHeader title="新建文章" description="创建一篇新的半导体产业资讯" />
      <ArticleForm companies={companies} />
    </div>
  );
}
