"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";
import Link from "next/link";

const sectionTypeOptions = [
  { value: "HERO_SLIDE", label: "Hero轮播" },
  { value: "TOPIC_CARD", label: "专题卡片" },
  { value: "TESTIMONIAL", label: "声音引语" },
  { value: "NAV_LINK", label: "导航链接" },
  { value: "FOOTER_COLUMN", label: "页脚列" },
  { value: "CTA_SECTION", label: "CTA区" },
];

const sectionTypeLabels: Record<string, string> = {
  HERO_SLIDE: "Hero轮播",
  TOPIC_CARD: "专题卡片",
  TESTIMONIAL: "声音引语",
  NAV_LINK: "导航链接",
  FOOTER_COLUMN: "页脚列",
  CTA_SECTION: "CTA区",
};

export default function EditPageSectionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [type, setType] = useState("HERO_SLIDE");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemsCount, setItemsCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/page-sections/${id}`);
        if (!res.ok) {
          toast("error", "加载失败");
          return;
        }
        const data = await res.json();
        setType(data.type);
        setCode(data.code);
        setTitle(data.title || "");
        setSort(String(data.sort));
        setActive(data.active);
        setItemsCount(data._count?.items ?? 0);
      } catch {
        toast("error", "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  const save = async () => {
    if (!code) {
      toast("error", "请填写标识码");
      return;
    }

    setSaving(true);
    try {
      const body = {
        type,
        code,
        title: title || null,
        sort: parseInt(sort) || 0,
        active,
      };

      const res = await fetch(`/api/admin/page-sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errorMsg = "保存失败";
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch {}
        toast("error", errorMsg);
        return;
      }

      toast("success", "板块已更新");
      router.push("/admin/page-sections");
    } catch {
      toast("error", "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/page-sections" className="text-sm text-cyan-400 hover:underline">
          &larr; 返回板块列表
        </Link>
      </div>

      <PageHeader
        title={`编辑板块: ${title || "未命名"}`}
        description={`类型: ${sectionTypeLabels[type] || type} · 标识码: ${code}`}
      />

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300">类型 *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          >
            {sectionTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">标识码 *</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-cyan-500/50"
            placeholder="unique-code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="板块标题（可选）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">排序</label>
          <input
            type="number"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="mt-1 w-32 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-white/20 bg-white/5"
          />
          启用
        </label>

        <div className="pt-4">
          <Link
            href={`/admin/page-sections/${id}/items`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-white/10 transition-colors"
          >
            管理条目 ({itemsCount})
          </Link>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving || !code}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存更改"}
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
