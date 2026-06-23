"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";

const categoryLabels: Record<string, string> = {
  INDUSTRY_TREND: "行业趋势",
  MARKET_ANALYSIS: "市场分析",
  TECHNOLOGY_REVIEW: "技术评测",
  COMPANY_PROFILE: "企业概况",
  CUSTOM_REPORT: "定制报告",
};

type ReportItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [items, setItems] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(page));

    fetch(`/api/admin/reports?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { items: ReportItem[]; total: number; totalPages: number }) => {
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        toast("error", "加载报告列表失败");
        setItems([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [q, category, page, toast]);

  const columns: Column<ReportItem>[] = [
    {
      key: "title",
      label: "报告名称",
      className: "max-w-xs truncate",
      render: (r) => (
        <Link href={`/admin/reports/${r.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {r.title}
        </Link>
      ),
    },
    {
      key: "category",
      label: "分类",
      render: (r) => (
        <span className="text-xs text-slate-400">
          {r.category ? categoryLabels[r.category] || r.category : "-"}
        </span>
      ),
    },
    {
      key: "price",
      label: "价格",
      render: (r) => (r.price != null ? `¥${r.price}` : "免费"),
    },
    {
      key: "downloadCount",
      label: "下载量",
    },
    {
      key: "publishedAt",
      label: "发布时间",
      render: (r) =>
        r.publishedAt
          ? new Date(r.publishedAt).toLocaleDateString("zh-CN")
          : "-",
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (r) => new Date(r.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (r) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/reports/${r.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
        </div>
      ),
    },
  ];

  const categoryFilters = [
    { value: "", label: "全部" },
    { value: "INDUSTRY_TREND", label: "行业趋势" },
    { value: "MARKET_ANALYSIS", label: "市场分析" },
    { value: "TECHNOLOGY_REVIEW", label: "技术评测" },
    { value: "COMPANY_PROFILE", label: "企业概况" },
    { value: "CUSTOM_REPORT", label: "定制报告" },
  ];

  return (
    <div>
      <PageHeader
        title="报告管理"
        description={`共 ${total} 份报告`}
        actions={
          <Link
            href="/admin/reports/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建报告
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索报告标题..." />
        <div className="flex gap-1">
          {categoryFilters.map((c) => (
            <Link
              key={c.value}
              href={c.value ? `/admin/reports?category=${c.value}` : "/admin/reports"}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (category === c.value) || (!category && !c.value)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyMessage={loading ? "加载中..." : "暂无报告"}
      />

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/reports" />
    </div>
  );
}
