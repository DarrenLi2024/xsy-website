"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  author: string | null;
  createdAt: string;
  publishedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
};

type ApiResponse = {
  items: Article[];
  total: number;
  page: number;
  totalPages: number;
};

export default function AdminArticlesPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (page > 1) params.set("page", String(page));
      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, status, page]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const items = data?.items ?? [];

  const columns: Column<Article>[] = [
    {
      key: "title",
      label: "标题",
      className: "max-w-xs truncate",
      render: (a) => (
        <Link href={`/admin/articles/${a.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {a.title}
        </Link>
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
      key: "author",
      label: "作者",
      render: (a) => a.author || "-",
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (a) => new Date(a.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (a) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/articles/${a.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="文章管理"
        description={`共 ${total} 篇`}
        actions={
          <Link
            href="/admin/articles/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建文章
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索标题或摘要..." />
        <div className="flex gap-1">
          {["", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"].map((s) => (
            <Link
              key={s}
              href={s ? `/admin/articles?status=${s}` : "/admin/articles"}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s || (!status && !s)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s ? ({ DRAFT: "草稿", PENDING_REVIEW: "待审", PUBLISHED: "已发布", ARCHIVED: "已归档" } as Record<string, string>)[s] : "全部"}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="暂无文章"
        />
      )}

      {!loading && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/articles" />
      )}
    </div>
  );
}
