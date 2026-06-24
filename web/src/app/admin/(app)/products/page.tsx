"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";

  const [data, setData] = useState<{
    items: Array<{
      id: string;
      name: string;
      category: string | null;
      status: string;
      sort: number;
      createdAt: string;
      company: { id: string; name: string; slug: string };
    }>;
    total: number;
    totalPages: number;
  }>({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ items: [], total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const columns: Column<(typeof data.items)[number]>[] = [
    {
      key: "name",
      label: "产品名称",
      render: (p) => (
        <Link
          href={`/admin/products/${p.id}`}
          className="text-white hover:text-cyan-400 transition-colors"
        >
          {p.name}
        </Link>
      ),
    },
    {
      key: "company",
      label: "所属企业",
      render: (p) => (
        <Link
          href={`/admin/companies/${p.company.id}`}
          className="text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {p.company.name}
        </Link>
      ),
    },
    {
      key: "category",
      label: "分类",
      render: (p) => p.category || "-",
    },
    {
      key: "status",
      label: "状态",
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "sort",
      label: "排序",
      render: (p) => p.sort,
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (p) => new Date(p.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (p) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/products/${p.id}`}
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
        title="产品管理"
        description={`共 ${loading ? "..." : data.total} 个产品`}
      />

      <div className="mb-4">
        <SearchInput placeholder="搜索产品名称..." />
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="暂无产品"
      />

      <Pagination
        currentPage={page}
        totalPages={data.totalPages}
        basePath="/admin/products"
      />
    </div>
  );
}
