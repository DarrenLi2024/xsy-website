"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

type Job = {
  id: string;
  title: string;
  type: string;
  city: string | null;
  status: string;
  createdAt: string;
  _count: { applications: number };
};

type ApiResponse = {
  items: Job[];
  total: number;
  page: number;
  totalPages: number;
};

export default function EnterpriseJobsPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const status = searchParams.get("status") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      if (status) params.set("status", status);
      const res = await fetch(`/api/enterprise/jobs?${params.toString()}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchJobs(), 0);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const typeLabels: Record<string, string> = {
    FULL_TIME: "全职", PART_TIME: "兼职", INTERNSHIP: "实习", CONTRACT: "合同",
  };

  const columns: Column<Job>[] = [
    {
      key: "title",
      label: "职位名称",
      className: "max-w-xs truncate",
      render: (j) => (
        <Link href={`/enterprise/jobs/${j.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {j.title}
        </Link>
      ),
    },
    {
      key: "type",
      label: "类型",
      render: (j) => <span className="text-xs text-slate-400">{typeLabels[j.type] || j.type}</span>,
    },
    {
      key: "city",
      label: "城市",
      render: (j) => j.city || "-",
    },
    {
      key: "applications",
      label: "应聘",
      render: (j) => (
        <Link href={`/enterprise/jobs/${j.id}/applicants`} className="text-cyan-400 hover:underline text-xs">
          {j._count.applications} 人
        </Link>
      ),
    },
    {
      key: "status",
      label: "状态",
      render: (j) => <StatusBadge status={j.status} />,
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (j) => new Date(j.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (j) => (
        <div className="inline-flex items-center gap-2">
          <Link href={`/enterprise/jobs/${j.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors">
            编辑
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="职位管理"
        description={`共 ${total} 个职位`}
        actions={
          <Link href="/enterprise/jobs/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors">
            发布职位
          </Link>
        }
      />
      <div className="mb-4 flex gap-1">
        {[{ v: "", l: "全部" }, { v: "PUBLISHED", l: "招聘中" }, { v: "DRAFT", l: "草稿" }, { v: "CLOSED", l: "已关闭" }].map((s) => (
          <Link key={s.v}
            href={s.v ? `/enterprise/jobs?status=${s.v}` : "/enterprise/jobs"}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (status === s.v) || (!status && !s.v) ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}>
            {s.l}
          </Link>
        ))}
      </div>
      {loading ? (
        <div className="text-center text-slate-500 py-12">加载中...</div>
      ) : (
        <DataTable columns={columns} data={items} emptyMessage="暂无职位" />
      )}
      {!loading && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/enterprise/jobs" />
      )}
    </div>
  );
}
