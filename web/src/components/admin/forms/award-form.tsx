"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

export default function AwardForm({
  initialData,
}: {
  initialData?: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    year: number;
    startDate: string;
    endDate: string;
    active: boolean;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [year, setYear] = useState(String(initialData?.year || new Date().getFullYear()));
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title, slug, summary: summary || null,
        year: parseInt(year),
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        active,
      };

      const url = isEdit ? `/api/admin/awards/${initialData.id}` : "/api/admin/awards";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      const result = await res.json();
      toast("success", isEdit ? "评选已更新" : "评选已创建");
      router.push(`/admin/awards/${isEdit ? initialData.id : result.id}`);
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300">评选名称</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-mono text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">简介</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">年份</label>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">开始时间</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">结束时间</label>
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)}
          className="rounded border-white/20 bg-white/5" /> 启用
      </label>
      <button onClick={save} disabled={saving || !title || !slug}
        className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
        {saving ? "保存中..." : isEdit ? "保存更改" : "创建评选"}
      </button>
    </div>
  );
}
