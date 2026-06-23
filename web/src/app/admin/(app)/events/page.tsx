"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";

interface EventItem {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  location: string | null;
  createdAt: string;
  company: { id: string; name: string; slug: string } | null;
}

type ApiResponse = {
  items: EventItem[];
  total: number;
  totalPages: number;
};

export default function AdminEventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      if (!res.ok) throw new Error("加载失败");
      const data: ApiResponse = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast("error", "加载活动列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, q, type, status, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const typeLabels: Record<string, string> = {
    EXHIBITION: "展会",
    CONFERENCE: "峰会",
    WEBINAR: "线上",
    SALON: "沙龙",
    WORKSHOP: "培训",
  };

  const columns: Column<EventItem>[] = [
    {
      key: "title",
      label: "活动名称",
      className: "max-w-xs truncate",
      render: (e) => (
        <Link href={`/admin/events/${e.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {e.title}
        </Link>
      ),
    },
    {
      key: "type",
      label: "类型",
      render: (e) => (
        <span className="text-xs text-slate-400">{typeLabels[e.type] || e.type}</span>
      ),
    },
    {
      key: "status",
      label: "状态",
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: "startDate",
      label: "开始时间",
      render: (e) => new Date(e.startDate).toLocaleDateString("zh-CN"),
    },
    {
      key: "location",
      label: "地点",
      render: (e) => e.location || "-",
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (e) => new Date(e.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (e) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/events/${e.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
          <Link
            href={`/admin/events/${e.id}/registrations`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            报名列表
          </Link>
        </div>
      ),
    },
  ];

  const statusFilters = [
    { value: "", label: "全部" },
    { value: "UPCOMING", label: "即将开始" },
    { value: "ONGOING", label: "进行中" },
    { value: "COMPLETED", label: "已结束" },
    { value: "CANCELLED", label: "已取消" },
  ];

  const typeFilters = [
    { value: "", label: "全部类型" },
    { value: "EXHIBITION", label: "展会" },
    { value: "CONFERENCE", label: "峰会" },
    { value: "WEBINAR", label: "线上" },
    { value: "SALON", label: "沙龙" },
    { value: "WORKSHOP", label: "培训" },
  ];

  return (
    <div>
      <PageHeader
        title="活动管理"
        description={`共 ${total} 个活动`}
        actions={
          <Link
            href="/admin/events/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建活动
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索活动标题..." />
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <Link
              key={s.value}
              href={s.value ? `/admin/events?status=${s.value}` : "/admin/events"}
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
            router.push(`/admin/events?${params.toString()}`);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 outline-none"
        >
          {typeFilters.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="暂无活动"
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-6">
          {page > 1 && (
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("page", String(page - 1));
                router.push(`/admin/events?${p.toString()}`);
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              上一页
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
            )
            .map((p, idx, arr) => {
              const elements: React.ReactNode[] = [];
              if (idx > 0 && arr[idx - 1] !== p - 1) {
                elements.push(
                  <span key={`ellipsis-${p}`} className="px-2 text-slate-600">...</span>,
                );
              }
              elements.push(
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(p));
                    router.push(`/admin/events?${params.toString()}`);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    p === page
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {p}
                </button>,
              );
              return elements;
            })}
          {page < totalPages && (
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("page", String(page + 1));
                router.push(`/admin/events?${p.toString()}`);
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              下一页
            </button>
          )}
        </div>
      )}
    </div>
  );
}
