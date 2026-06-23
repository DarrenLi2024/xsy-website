"use client";

import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

interface AwardCampaign {
  id: string;
  title: string;
  slug: string;
  year: number;
  active: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ApiResponse {
  items: AwardCampaign[];
  total: number;
  page: number;
  totalPages: number;
  years: number[];
}

export default function AdminAwardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const active = searchParams.get("active") || "";
  const year = searchParams.get("year") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (q) params.set("q", q);
    if (active) params.set("active", active);
    if (year) params.set("year", year);

    fetch(`/api/admin/awards?${params.toString()}`)
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        toast("error", "加载评选列表失败");
        setLoading(false);
      });
  }, [page, q, active, year, toast]);

  const columns: Column<AwardCampaign>[] = [
    {
      key: "title",
      label: "评选名称",
      className: "max-w-xs truncate",
      render: (a) => (
        <Link href={`/admin/awards/${a.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {a.title}
        </Link>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (a) => (
        <span className="text-xs font-mono text-slate-500">{a.slug}</span>
      ),
    },
    {
      key: "year",
      label: "年份",
      render: (a) => <span className="text-sm text-slate-300">{a.year}</span>,
    },
    {
      key: "active",
      label: "状态",
      render: (a) =>
        a.active ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            进行中
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            已结束
          </span>
        ),
    },
    {
      key: "startDate",
      label: "开始时间",
      render: (a) => new Date(a.startDate).toLocaleDateString("zh-CN"),
    },
    {
      key: "endDate",
      label: "结束时间",
      render: (a) => new Date(a.endDate).toLocaleDateString("zh-CN"),
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
            href={`/admin/awards/${a.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
        </div>
      ),
    },
  ];

  const activeFilters = [
    { value: "", label: "全部" },
    { value: "true", label: "进行中" },
    { value: "false", label: "已结束" },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="评选活动管理"
          description="加载中..."
          actions={
            <Link
              href="/admin/awards/new"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              新建评选
            </Link>
          }
        />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { items, total, totalPages, years } = data;

  return (
    <div>
      <PageHeader
        title="评选活动管理"
        description={`共 ${total} 个评选活动`}
        actions={
          <Link
            href="/admin/awards/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建评选
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索评选名称..." />
        <div className="flex gap-1">
          {activeFilters.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/admin/awards?active=${f.value}` : "/admin/awards"}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (active === f.value) || (!active && !f.value)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <select
          defaultValue={year}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (e.target.value) params.set("year", e.target.value);
            router.push(`/admin/awards?${params.toString()}`);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 outline-none"
        >
          <option value="">全部年份</option>
          {years.map((y: number) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyMessage="暂无评选活动"
      />

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/awards" />
    </div>
  );
}
