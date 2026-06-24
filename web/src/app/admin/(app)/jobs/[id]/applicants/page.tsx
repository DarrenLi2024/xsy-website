"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import { useToast } from "@/components/admin/toast";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  createdAt: string;
};

type ApiResponse = {
  items: Application[];
  total: number;
  page: number;
  totalPages: number;
};

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { toast } = useToast();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);

      const [jobRes, appRes] = await Promise.all([
        fetch(`/api/admin/jobs/${jobId}`),
        fetch(`/api/admin/jobs/${jobId}/applicants?${params.toString()}`),
      ]);

      if (jobRes.ok) {
        const job = await jobRes.json();
        setJobTitle(job.title);
      }
      if (appRes.ok) {
        setData(await appRes.json());
      }
    } catch {
      toast("error", "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, [jobId, page, statusFilter, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch(
        `/api/admin/jobs/${jobId}/applicants?applicationId=${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) {
        toast("error", "状态更新失败");
        return;
      }
      toast("success", "状态已更新");
      void fetchData();
    } catch {
      toast("error", "状态更新失败");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<Application>[] = [
    { key: "name", label: "姓名" },
    { key: "email", label: "邮箱" },
    { key: "phone", label: "电话", render: (a) => a.phone || "-" },
    {
      key: "resumeUrl",
      label: "简历",
      render: (a) =>
        a.resumeUrl ? (
          <a
            href={a.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 text-xs"
          >
            查看简历
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "status",
      label: "状态",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "createdAt",
      label: "投递时间",
      render: (a) => new Date(a.createdAt).toLocaleString("zh-CN"),
    },
  ];

  const statusActions = [
    { value: "REVIEWED", label: "标记已查看" },
    { value: "INTERVIEWING", label: "邀请面试" },
    { value: "ACCEPTED", label: "录用" },
    { value: "REJECTED", label: "不合适" },
  ];

  // client-side filter for empty search
  const [showCoverLetter, setShowCoverLetter] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title={`应聘者管理: ${jobTitle || "加载中..."}`}
        description={data ? `共 ${data.total} 位应聘者` : "加载中..."}
        actions={
          <Link
            href={`/admin/jobs/${jobId}`}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
          >
            返回编辑
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {[
            { value: "", label: "全部" },
            { value: "PENDING", label: "待处理" },
            { value: "REVIEWED", label: "已查看" },
            { value: "INTERVIEWING", label: "面试中" },
            { value: "ACCEPTED", label: "已录用" },
            { value: "REJECTED", label: "不合适" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ${col.className || ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    求职信
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-white/[0.02]">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-slate-300 ${col.className || ""}`}
                      >
                        {col.render
                          ? col.render(app)
                          : String((app as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm">
                      {app.coverLetter ? (
                        <button
                          onClick={() => setShowCoverLetter(showCoverLetter === app.id ? null : app.id)}
                          className="text-cyan-400 hover:text-cyan-300 text-xs"
                        >
                          {showCoverLetter === app.id ? "收起" : "查看"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">无</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {statusActions.map((action) => (
                          <button
                            key={action.value}
                            onClick={() => updateStatus(app.id, action.value)}
                            disabled={updatingId === app.id || app.status === action.value}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cover Letter detail */}
          {showCoverLetter && data.items.find((a) => a.id === showCoverLetter)?.coverLetter && (
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h4 className="text-sm font-medium text-white mb-2">求职信</h4>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">
                {data.items.find((a) => a.id === showCoverLetter)?.coverLetter}
              </p>
            </div>
          )}

          {data.items.length === 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
              <p className="text-sm text-slate-500">暂无应聘者</p>
            </div>
          )}

          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            basePath={`/admin/jobs/${jobId}/applicants`}
          />
        </>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">暂无应聘者</p>
        </div>
      )}
    </div>
  );
}
