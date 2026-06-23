import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import ArticleForm from "@/components/admin/forms/article-form";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const user = await getAdminUser();
  if (!user) return null;

  const [article, companies] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { company: { select: { name: true } } } }),
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!article || article.deletedAt) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title={`编辑: ${article.title}`} />
        <StatusBadge status={article.status} />
      </div>
      <div className="mb-6 text-xs text-slate-500">
        ID: {article.id} · 分类: {article.category || "-"} · 创建于 {new Date(article.createdAt).toLocaleDateString("zh-CN")}
        {article.publishedAt && ` · 发布于 ${new Date(article.publishedAt).toLocaleDateString("zh-CN")}`}
      </div>
      <ArticleForm
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary || "",
          content: article.content,
          coverImage: article.coverImage || "",
          category: article.category || "",
          tags: article.tags,
          author: article.author || "",
          source: article.source || "",
          companyId: article.companyId,
          isFeatured: article.isFeatured,
          status: article.status,
          publishedAt: article.publishedAt?.toISOString() || null,
        }}
        companies={companies}
      />
    </div>
  );
}
