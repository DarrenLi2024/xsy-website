"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import type { Column } from "@/components/admin/data-table";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  author: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
};

type ApiResponse = {
  items: Article[];
  total: number;
  page: number;
  totalPages: number;
};

export default function EnterpriseArticlesPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      const res = await fetch(`/api/enterprise/articles?${params.toString()}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Article>[] = [
    {
      key: "title",
      label: "标题",
      className: "max-w-xs truncate",
      render: (a) => (
        <a href={`/articles/${a.slug}`} target="_blank" className="text-white hover:text-cyan-400 transition-colors">
          {a.title}
        </a>
      ),
    },
    {
      key: "category",
      label: "分类",
      render: (a) => a.category || "-",
    },
    {
      key: "status",
      label: "状态",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "viewCount",
      label: "阅读量",
    },
    {
      key: "publishedAt",
      label: "发布时间",
      render: (a) => a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("zh-CN") : "-",
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (a) => new Date(a.createdAt).toLocaleDateString("zh-CN"),
    },
  ];

  return (
    <div>
      <PageHeader title="我的文章" description={`共 ${total} 篇关联文章`} />

      {loading ? (
        <div className="text-center text-slate-500 py-12">加载中...</div>
      ) : (
        <DataTable columns={columns} data={items} emptyMessage="暂无关联文章" />
      )}

      {!loading && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/enterprise/articles" />
      )}
    </div>
  );
}
