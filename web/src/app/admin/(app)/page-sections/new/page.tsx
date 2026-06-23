"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";

const sectionTypeOptions = [
  { value: "HERO_SLIDE", label: "Hero轮播" },
  { value: "TOPIC_CARD", label: "专题卡片" },
  { value: "TESTIMONIAL", label: "声音引语" },
  { value: "NAV_LINK", label: "导航链接" },
  { value: "FOOTER_COLUMN", label: "页脚列" },
  { value: "CTA_SECTION", label: "CTA区" },
];

export default function NewPageSectionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [type, setType] = useState("HERO_SLIDE");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const res = await fetch("/api/admin/page-sections", {
        method: "POST",
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

      toast("success", "板块已创建");
      router.push("/admin/page-sections");
    } catch {
      toast("error", "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="新建板块" description="创建一个新的页面板块" />

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

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={saving || !code}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : "创建板块"}
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
