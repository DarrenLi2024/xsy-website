"use client";

import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

interface JobItem {
  id: string;
  title: string;
  type: string;
  status: string;
  city: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: string | null;
  education: string | null;
  createdAt: string;
  _count: { applications: number };
  company: { name: string } | null;
}

interface ApiResponse {
  items: JobItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (status) params.set("status", status);

    fetch(`/api/admin/jobs?${params.toString()}`)
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        toast("error", "加载职位列表失败");
        setLoading(false);
      });
  }, [page, q, type, status, toast]);

  const typeLabels: Record<string, string> = {
    FULL_TIME: "全职",
    PART_TIME: "兼职",
    INTERNSHIP: "实习",
    CONTRACT: "合同",
  };

  const columns: Column<JobItem>[] = [
    {
      key: "title",
      label: "职位名称",
      className: "max-w-xs truncate",
      render: (j) => (
        <Link href={`/admin/jobs/${j.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {j.title}
        </Link>
      ),
    },
    {
      key: "company",
      label: "企业",
      render: (j) => (
        <span className="text-xs text-slate-400">{j.company?.name || "-"}</span>
      ),
    },
    {
      key: "type",
      label: "类型",
      render: (j) => (
        <span className="text-xs text-slate-400">{typeLabels[j.type] || j.type}</span>
      ),
    },
    {
      key: "city",
      label: "城市",
      render: (j) => j.city || "-",
    },
    {
      key: "salary",
      label: "薪资",
      render: (j) => {
        if (j.salaryMin && j.salaryMax) return `${j.salaryMin}K-${j.salaryMax}K`;
        if (j.salaryMin) return `${j.salaryMin}K起`;
        if (j.salaryMax) return `至${j.salaryMax}K`;
        return "面议";
      },
    },
    {
      key: "applications",
      label: "申请数",
      render: (j) => j._count.applications,
    },
    {
      key: "status",
      label: "状态",
      render: (j) => <StatusBadge status={j.status} />,
    },
    {
      key: "createdAt",
      label: "发布时间",
      render: (j) => new Date(j.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (j) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/jobs/${j.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
          <Link
            href={`/admin/jobs/${j.id}/applicants`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            应聘者
          </Link>
        </div>
      ),
    },
  ];

  const statusFilters = [
    { value: "", label: "全部" },
    { value: "PUBLISHED", label: "招聘中" },
    { value: "DRAFT", label: "草稿" },
    { value: "CLOSED", label: "已关闭" },
  ];

  const typeFilters = [
    { value: "", label: "全部类型" },
    { value: "FULL_TIME", label: "全职" },
    { value: "PART_TIME", label: "兼职" },
    { value: "INTERNSHIP", label: "实习" },
    { value: "CONTRACT", label: "合同" },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="职位管理"
          description="加载中..."
          actions={
            <Link
              href="/admin/jobs/new"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              新建职位
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

  const { items, total, totalPages } = data;

  return (
    <div>
      <PageHeader
        title="职位管理"
        description={`共 ${total} 个职位`}
        actions={
          <Link
            href="/admin/jobs/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建职位
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索职位标题..." />
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <Link
              key={s.value}
              href={s.value ? `/admin/jobs?status=${s.value}` : "/admin/jobs"}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (status === s.value) || (!status && !s.value)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <select
          defaultValue={type}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (e.target.value) params.set("type", e.target.value);
            router.push(`/admin/jobs?${params.toString()}`);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 outline-none"
        >
          {typeFilters.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyMessage="暂无职位"
      />

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/jobs" />
    </div>
  );
}
