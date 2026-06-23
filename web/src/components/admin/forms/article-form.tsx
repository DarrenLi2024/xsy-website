"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/admin/toast";

type Company = { id: string; name: string; slug: string };

export default function ArticleForm({
  initialData,
  companies,
}: {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string;
    category: string;
    tags: string[];
    author: string;
    source: string;
    companyId: string | null;
    isFeatured: boolean;
    status: string;
    publishedAt: string | null;
  };
  companies: Company[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [category, setCategory] = useState(initialData?.category || "IC设计");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [source, setSource] = useState(initialData?.source || "");
  const [companyId, setCompanyId] = useState(initialData?.companyId || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [saving, setSaving] = useState(false);

  const autoSlug = useCallback((t: string) => {
    return t
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const save = async (targetStatus: string) => {
    setSaving(true);
    try {
      const body = {
        title,
        slug,
        summary,
        content,
        coverImage,
        category,
        tags,
        author,
        source,
        companyId: companyId || null,
        isFeatured,
        status: targetStatus,
      };

      const url = isEdit
        ? `/api/admin/articles/${initialData.id}`
        : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast("error", err.error || "保存失败");
        return;
      }

      const result = await res.json();
      toast("success", isEdit ? "文章已更新" : "文章已创建");
      router.push(`/admin/articles/${isEdit ? initialData!.id : result.id}`);
    } catch {
      toast("error", "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!initialData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${initialData.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast("error", "状态更新失败");
        return;
      }
      setStatus(newStatus);
      toast("success", "状态已更新");
      router.refresh();
    } catch {
      toast("error", "状态更新失败");
    } finally {
      setSaving(false);
    }
  };

  const statusActions: Record<string, string[]> = {
    DRAFT: ["PENDING_REVIEW"],
    PENDING_REVIEW: ["APPROVED", "REJECTED"],
    APPROVED: ["PUBLISHED"],
    REJECTED: ["DRAFT"],
    PUBLISHED: ["ARCHIVED"],
    ARCHIVED: ["DRAFT"],
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">标题</label>
          <input
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              if (!isEdit) {
                setSlug(autoSlug(nextTitle));
              }
            }}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50"
            placeholder="文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 outline-none focus:border-cyan-500/50 font-mono"
            placeholder="article-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">摘要</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="文章摘要..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">正文 (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white font-mono outline-none focus:border-cyan-500/50"
            placeholder="使用 Markdown 格式撰写正文..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-white">发布设置</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                {["IC设计", "制造与封测", "汽车电子", "AI算力芯片", "光通信", "EDA", "半导体设备", "医疗电子", "互连", "材料", "市场分析"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">标签</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                    {t}
                    <button onClick={() => removeTag(t)} className="text-slate-500 hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
              <div className="mt-1 flex gap-1">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
                  placeholder="添加标签"
                />
                <button onClick={addTag} className="rounded-lg bg-white/10 px-2 py-1.5 text-xs text-slate-300 hover:text-white">+</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">作者</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">来源</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">关联企业</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">无</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">封面图 URL</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                placeholder="https://..."
              />
              {coverImage && (
                <Image
                  src={coverImage}
                  alt=""
                  width={640}
                  height={96}
                  className="mt-2 h-24 w-full rounded-lg object-cover"
                  unoptimized
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-white/20 bg-white/5"
              />
              设为头条
            </label>
          </div>
        </div>

        <div className="space-y-2">
          {isEdit && (
            <div className="flex flex-wrap gap-2">
              {statusActions[status]?.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => changeStatus(nextStatus)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  {status === "DRAFT" && nextStatus === "PENDING_REVIEW" ? "提交审核" :
                   nextStatus === "APPROVED" ? "审核通过" :
                   nextStatus === "REJECTED" ? "驳回" :
                   nextStatus === "PUBLISHED" ? "发布" :
                   nextStatus === "ARCHIVED" ? "归档" :
                   nextStatus === "DRAFT" && status === "REJECTED" ? "返回草稿" :
                   `改为 ${nextStatus}`}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => save(isEdit ? status : "DRAFT")}
            disabled={saving}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : isEdit ? "保存更改" : "保存草稿"}
          </button>

          {!isEdit && (
            <button
              onClick={() => save("PUBLISHED")}
              disabled={saving || !title}
              className="w-full rounded-xl border border-cyan-500/30 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
            >
              保存并发布
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
