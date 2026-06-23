"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

export default function ReportForm({
  initialData,
}: {
  initialData?: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    fileUrl: string;
    price: number | null;
    category: string;
    tags: string[];
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [category, setCategory] = useState(initialData?.category || "INDUSTRY_TREND");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title, description: description || null,
        coverImage: coverImage || null, fileUrl: fileUrl || null,
        price: price ? parseFloat(price) : null,
        category, tags,
      };

      const url = isEdit ? `/api/admin/reports/${initialData.id}` : "/api/admin/reports";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      const result = await res.json();
      toast("success", isEdit ? "报告已更新" : "报告已创建");
      router.push(`/admin/reports/${isEdit ? initialData.id : result.id}`);
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">报告标题</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">封面图 URL</label>
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">文件 URL</label>
          <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none" placeholder="PDF 下载链接" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">报告信息</h3>
          <div>
            <label className="block text-xs font-medium text-slate-500">分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              {[{ v: "INDUSTRY_TREND", l: "行业趋势" }, { v: "MARKET_ANALYSIS", l: "市场分析" }, { v: "TECHNOLOGY_REVIEW", l: "技术综述" }, { v: "COMPANY_PROFILE", l: "企业档案" }, { v: "CUSTOM_REPORT", l: "定制报告" }].map((c) => (
                <option key={c.v} value={c.v}>{c.l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">价格 (元)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="0 为免费" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">标签</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-slate-500 hover:text-white">&times;</button>
                </span>
              ))}
            </div>
            <div className="mt-1 flex gap-1">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none" placeholder="添加标签" />
              <button onClick={addTag} className="rounded-lg bg-white/10 px-2 py-1.5 text-xs text-slate-300 hover:text-white">+</button>
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving || !title}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建报告"}
        </button>
      </div>
    </div>
  );
}
