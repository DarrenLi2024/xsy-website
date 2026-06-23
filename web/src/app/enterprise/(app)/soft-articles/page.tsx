"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import type { Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";
import { Plus } from "lucide-react";

type SoftArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  mediaName: string | null;
  category: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  mediaChannel?: { name: string } | null;
};

type ApiResponse = {
  items: SoftArticle[];
  total: number;
  page: number;
  totalPages: number;
};

export default function EnterpriseSoftArticlesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "", mediaChannelId: "" });
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      const res = await fetch(`/api/enterprise/soft-articles?${params.toString()}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData(null);
      toast("error", "加载软文列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetch("/api/admin/media?limit=100&status=VERIFIED")
      .then((r) => r.json())
      .then((d) => setChannels(d.items || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast("error", "请填写标题和内容");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/enterprise/soft-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "提交失败");
      }
      toast("success", "软文提交成功，等待审核");
      setShowForm(false);
      setForm({ title: "", content: "", category: "", mediaChannelId: "" });
      fetchArticles();
    } catch (err: any) {
      toast("error", err.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<SoftArticle>[] = [
    {
      key: "title",
      label: "标题",
      className: "max-w-xs truncate",
      render: (a) => (
        <span className="text-white font-medium">{a.title}</span>
      ),
    },
    {
      key: "category",
      label: "分类",
      render: (a) => a.category || "-",
    },
    {
      key: "mediaChannel",
      label: "目标媒体",
      render: (a) => a.mediaChannel?.name ?? a.mediaName ?? "-",
    },
    {
      key: "status",
      label: "审核状态",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "viewCount",
      label: "阅读量",
    },
    {
      key: "publishedAt",
      label: "发布时间",
      render: (a) => a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("zh-CN") : "-",
    },
    {
      key: "createdAt",
      label: "提交时间",
      render: (a) => new Date(a.createdAt).toLocaleDateString("zh-CN"),
    },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "待审核",
    APPROVED: "已通过",
    REJECTED: "已驳回",
    PUBLISHED: "已发布",
  };

  return (
    <div>
      <PageHeader
        title="软文投放"
        description={`共 ${total} 篇软文`}
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            提交软文
          </button>
        }
      />

      {showForm && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">新建软文</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                placeholder="输入软文标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">分类</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                placeholder="如：行业资讯、产品发布"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">目标媒体渠道</label>
              <select
                value={form.mediaChannelId}
                onChange={(e) => setForm({ ...form, mediaChannelId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="">选择媒体渠道（可选）</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">正文</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={12}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none resize-y"
                placeholder="输入软文正文内容（支持 Markdown）"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? "提交中..." : "提交审核"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-white/10 px-6 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500 py-12">加载中...</div>
      ) : (
        <DataTable columns={columns} data={items} emptyMessage="暂无软文，点击上方按钮提交第一篇" />
      )}

      {!loading && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/enterprise/soft-articles" />
      )}
    </div>
  );
}
