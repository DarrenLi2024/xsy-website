"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

type Product = {
  id: string;
  name: string;
  category: string | null;
  status: string;
  createdAt: string;
};

type ApiResponse = {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
};

export default function EnterpriseProductsPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (page > 1) params.set("page", String(page));
      const res = await fetch(`/api/enterprise/products?${params.toString()}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchProducts(), 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "产品名称",
      render: (p) => (
        <Link href={`/enterprise/products/${p.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {p.name}
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
      key: "createdAt",
      label: "创建时间",
      render: (p) => new Date(p.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (p) => (
        <Link href={`/enterprise/products/${p.id}`}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors">
          编辑
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="产品管理"
        description={`共 ${total} 个产品`}
        actions={
          <Link href="/enterprise/products/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors">
            新建产品
          </Link>
        }
      />
      <div className="mb-4">
        <SearchInput placeholder="搜索产品名称..." />
      </div>
      {loading ? (
        <div className="text-center text-slate-500 py-12">加载中...</div>
      ) : (
        <DataTable columns={columns} data={items} emptyMessage="暂无产品" />
      )}
      {!loading && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/enterprise/products" />
      )}
    </div>
  );
}
