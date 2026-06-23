"use client";

import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import type { Column } from "@/components/admin/data-table";
import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/toast";

const CHANNEL_TYPES: Record<string, string> = {
  WECHAT_MP: "公众号",
  TOUTIAO: "头条号",
  ZHIHU: "知乎",
  WEIBO: "微博",
  LINKEDIN: "领英",
  BILIBILI: "B站",
  WEBSITE: "网站",
  OTHER: "其他",
};

interface MediaChannel {
  id: string;
  name: string;
  type: string;
  url: string | null;
  description: string | null;
  active: boolean;
  _count: { articles: number };
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MediaChannel | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setItems(d.items))
      .catch(() => toast("error", "加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      type: (form.elements.namedItem("type") as HTMLSelectElement).value,
      url: (form.elements.namedItem("url") as HTMLInputElement).value.trim() || null,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim() || null,
      active: (form.elements.namedItem("active") as HTMLInputElement).checked,
    };

    try {
      const url = editItem ? `/api/admin/media/${editItem.id}` : "/api/admin/media";
      const res = await fetch(url, {
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "操作失败");
      }
      toast("success", editItem ? "渠道已更新" : "渠道已创建");
      setShowForm(false);
      setEditItem(null);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "操作失败");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该媒体渠道？")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      toast("success", "已删除");
      fetchData();
    } catch {
      toast("error", "删除失败");
    }
  };

  const columns: Column<MediaChannel>[] = [
    { key: "name", label: "渠道名称", render: (c) => c.name },
    {
      key: "type",
      label: "类型",
      render: (c) => CHANNEL_TYPES[c.type] || c.type,
    },
    {
      key: "url",
      label: "链接",
      render: (c) => c.url ? <span className="text-cyan-400 text-xs">{c.url}</span> : "-",
    },
    {
      key: "articles",
      label: "发文数",
      render: (c) => c._count.articles,
    },
    {
      key: "active",
      label: "状态",
      render: (c) => c.active ? (
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">启用</span>
      ) : (
        <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-xs text-slate-400">停用</span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (c) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => { setEditItem(c); setShowForm(true); }}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10"
          >
            编辑
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader title="媒体渠道管理" description="加载中..." />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="媒体渠道管理"
        description={`共 ${items.length} 个渠道`}
        actions={
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新增渠道
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">
            {editItem ? "编辑渠道" : "新增渠道"}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">名称 *</label>
              <input
                name="name"
                required
                defaultValue={editItem?.name || ""}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">类型</label>
              <select
                name="type"
                defaultValue={editItem?.type || "OTHER"}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
              >
                {Object.entries(CHANNEL_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
              <input
                name="url"
                defaultValue={editItem?.url || ""}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">描述</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editItem?.description || ""}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2 resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input name="active" type="checkbox" defaultChecked={editItem ? editItem.active : true} className="rounded" />
                启用
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {formLoading ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditItem(null); }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={items} emptyMessage="暂无媒体渠道" />
    </div>
  );
}
