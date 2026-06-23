import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import ArticleForm from "@/components/admin/forms/article-form";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const user = await getAdminUser();
  if (!user) return null;

  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="新建文章" description="创建一篇新的半导体产业资讯" />
      <ArticleForm companies={companies} />
    </div>
  );
}
