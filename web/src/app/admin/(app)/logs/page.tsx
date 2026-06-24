"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import type { Column } from "@/components/admin/data-table";

const ACTION_LABELS: Record<string, string> = {
  CREATE_ARTICLE: "创建文章",
  UPDATE_ARTICLE: "更新文章",
  DELETE_ARTICLE: "删除文章",
  APPROVE_COMPANY: "通过企业",
  REJECT_COMPANY: "驳回企业",
  SUSPEND_COMPANY: "冻结企业",
  CREATE_COMPANY: "创建企业",
  UPDATE_COMPANY: "更新企业",
  CREATE_USER: "创建用户",
  UPDATE_USER: "更新用户",
  DELETE_USER: "删除用户",
};

const RESOURCE_LABELS: Record<string, string> = {
  Article: "文章",
  Company: "企业",
  User: "用户",
  Event: "活动",
  Job: "招聘",
  Report: "报告",
  Ad: "广告",
  Setting: "设置",
};

export default function AdminLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const action = searchParams.get("action") || "";
  const resource = searchParams.get("resource") || "";
  const userId = searchParams.get("userId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const [data, setData] = useState<{
    items: Array<{
      id: string;
      createdAt: string;
      userEmail: string | null;
      userId: string | null;
      action: string;
      resource: string;
      resourceId: string | null;
    }>;
    total: number;
    totalPages: number;
  }>({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (action) params.set("action", action);
    if (resource) params.set("resource", resource);
    if (userId) params.set("userId", userId);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    try {
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [page, action, resource, userId, dateFrom, dateTo]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const resourceTypes = useMemo(() => {
    const seen = new Set<string>();
    return data.items.filter((l) => {
      if (seen.has(l.resource)) return false;
      seen.add(l.resource);
      return true;
    }).map((l) => l.resource).sort();
  }, [data.items]);

  const actionTypes = useMemo(() => {
    const seen = new Set<string>();
    return data.items.filter((l) => {
      if (seen.has(l.action)) return false;
      seen.add(l.action);
      return true;
    }).map((l) => l.action).sort();
  }, [data.items]);

  const columns: Column<(typeof data.items)[number]>[] = [
    {
      key: "createdAt",
      label: "时间",
      render: (l) => (
        <span className="text-xs text-slate-300 whitespace-nowrap">
          {new Date(l.createdAt).toLocaleString("zh-CN")}
        </span>
      ),
    },
    {
      key: "userEmail",
      label: "用户",
      render: (l) => (
        <span className="text-xs text-slate-300">
          {l.userEmail || l.userId || "-"}
        </span>
      ),
    },
    {
      key: "action",
      label: "操作",
      render: (l) => (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
          {ACTION_LABELS[l.action] || l.action}
        </span>
      ),
    },
    {
      key: "resource",
      label: "资源类型",
      render: (l) => (
        <span className="text-xs text-slate-400">
          {RESOURCE_LABELS[l.resource] || l.resource}
        </span>
      ),
    },
    {
      key: "resourceId",
      label: "资源 ID",
      render: (l) =>
        l.resourceId ? (
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-500 font-mono">
            {l.resourceId.slice(0, 12)}...
          </code>
        ) : (
          <span className="text-slate-600">-</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="审计日志"
        description={`共 ${loading ? "..." : data.total} 条记录`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Resource filter */}
        <select
          defaultValue={resource}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (e.target.value) params.set("resource", e.target.value);
            if (action) params.set("action", action);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (dateTo) params.set("dateTo", dateTo);
            router.push(`/admin/logs?${params.toString()}`);
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">所有资源</option>
          {resourceTypes.map((r) => (
            <option key={r} value={r}>
              {RESOURCE_LABELS[r] || r}
            </option>
          ))}
        </select>

        {/* Action filter */}
        <select
          defaultValue={action}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (resource) params.set("resource", resource);
            if (e.target.value) params.set("action", e.target.value);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (dateTo) params.set("dateTo", dateTo);
            router.push(`/admin/logs?${params.toString()}`);
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">所有操作</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] || a}
            </option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          defaultValue={dateFrom}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (resource) params.set("resource", resource);
            if (action) params.set("action", action);
            if (e.target.value) params.set("dateFrom", e.target.value);
            if (dateTo) params.set("dateTo", dateTo);
            router.push(`/admin/logs?${params.toString()}`);
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
        />
        <span className="text-xs text-slate-500">至</span>
        <input
          type="date"
          defaultValue={dateTo}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (resource) params.set("resource", resource);
            if (action) params.set("action", action);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (e.target.value) params.set("dateTo", e.target.value);
            router.push(`/admin/logs?${params.toString()}`);
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="暂无日志记录"
      />

      <Pagination currentPage={page} totalPages={data.totalPages} basePath="/admin/logs" />
    </div>
  );
}
