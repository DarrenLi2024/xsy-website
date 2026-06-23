"use client";

import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/admin/toast";

const INDUSTRIES = [
  "IC设计",
  "制造与封测",
  "汽车电子",
  "AI算力芯片",
  "光通信",
  "EDA",
  "半导体设备",
  "医疗电子",
  "互连",
  "材料",
  "市场分析",
  "其他",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待处理",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  SUSPENDED: "已冻结",
};

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  city: string | null;
  status: string;
  createdAt: string;
}

interface ApiResponse {
  items: Company[];
  total: number;
  page: number;
  totalPages: number;
}

async function updateStatus(id: string, status: string) {
  const res = await fetch(`/api/admin/companies/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "操作失败");
  }
  return res.json();
}

export default function AdminCompaniesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const industry = searchParams.get("industry") || "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (industry) params.set("industry", industry);

    fetch(`/api/admin/companies?${params.toString()}`)
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        toast("error", "加载企业列表失败");
        setLoading(false);
      });
  }, [page, q, status, industry, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateStatus(id, newStatus);
      toast("success", newStatus === "APPROVED" ? "已通过审核" : "已驳回申请");
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "操作失败");
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<Company>[] = [
    {
      key: "name",
      label: "企业名称",
      render: (c) => (
        <Link
          href={`/admin/companies/${c.id}`}
          className="text-white hover:text-cyan-400 transition-colors"
        >
          {c.name}
        </Link>
      ),
    },
    {
      key: "industry",
      label: "行业",
      render: (c) => c.industry || "-",
    },
    {
      key: "city",
      label: "城市",
      render: (c) => c.city || "-",
    },
    {
      key: "status",
      label: "状态",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (c) => new Date(c.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (c) => (
        <div className="inline-flex items-center gap-1.5">
          {c.status === "PENDING" && (
            <>
              <button
                onClick={() => handleStatusChange(c.id, "APPROVED")}
                disabled={actionLoading === c.id}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === c.id ? "..." : "通过"}
              </button>
              <button
                onClick={() => handleStatusChange(c.id, "REJECTED")}
                disabled={actionLoading === c.id}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === c.id ? "..." : "驳回"}
              </button>
            </>
          )}
          <Link
            href={`/admin/companies/${c.id}`}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="企业管理"
          description="加载中..."
          actions={
            <Link
              href="/admin/companies/new"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              新建企业
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
        title="企业管理"
        description={`共 ${total} 家企业`}
        actions={
          <Link
            href="/admin/companies/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建企业
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索企业名称或简介..." />
        <div className="flex gap-1">
          {["", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
            <Link
              key={s}
              href={
                s
                  ? `/admin/companies?status=${s}${industry ? `&industry=${industry}` : ""}`
                  : `/admin/companies${industry ? `?industry=${industry}` : ""}`
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s || (!status && !s)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s ? STATUS_LABELS[s] : "全部"}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Link
            href={status ? `/admin/companies?status=${status}` : "/admin/companies"}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !industry ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            全部行业
          </Link>
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind}
              href={`/admin/companies?industry=${ind}${status ? `&status=${status}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                industry === ind
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {ind}
            </Link>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyMessage="暂无企业"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/companies"
      />
    </div>
  );
}
