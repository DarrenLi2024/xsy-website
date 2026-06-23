"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";
import { Plus, X } from "lucide-react";

type SettingsData = {
  siteName?: string;
  siteDescription?: string;
  seoTitle?: string;
  articleCategories?: string[];
  industryOptions?: string[];
  companyScaleOptions?: string[];
};

export default function SettingsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Site Info
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");

  // Options
  const [articleCategories, setArticleCategories] = useState<string[]>(["IC设计", "制造与封测"]);
  const [industryOptions, setIndustryOptions] = useState<string[]>(["半导体", "集成电路"]);
  const [companyScaleOptions, setCompanyScaleOptions] = useState<string[]>(["0-50人", "50-200人", "200-500人", "500-1000人", "1000人以上"]);

  const [newCategory, setNewCategory] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newScale, setNewScale] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data: SettingsData = await res.json();
          if (data.siteName !== undefined) setSiteName(data.siteName);
          if (data.siteDescription !== undefined) setSiteDescription(data.siteDescription);
          if (data.seoTitle !== undefined) setSeoTitle(data.seoTitle);
          if (data.articleCategories !== undefined) setArticleCategories(data.articleCategories);
          if (data.industryOptions !== undefined) setIndustryOptions(data.industryOptions);
          if (data.companyScaleOptions !== undefined) setCompanyScaleOptions(data.companyScaleOptions);
        }
      } catch {
        toast("error", "加载设置失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try {
      const body: SettingsData = {
        siteName,
        siteDescription,
        seoTitle,
        articleCategories,
        industryOptions,
        companyScaleOptions,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast("error", err.error || "保存失败");
        return;
      }

      toast("success", "设置已保存");
    } catch {
      toast("error", "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (
    list: string[],
    setter: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
  ) => {
    const t = input.trim();
    if (t && !list.includes(t)) {
      setter([...list, t]);
      setInput("");
    }
  };

  const removeItem = (list: string[], setter: (v: string[]) => void, item: string) => {
    setter(list.filter((x) => x !== item));
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
      <PageHeader title="系统设置" description="管理网站全局设置和选项" />

      <div className="max-w-2xl space-y-8">
        {/* Site Info */}
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-6">
          <h2 className="text-base font-semibold text-white mb-4">站点信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">站点名称</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                placeholder="芯师爷"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">站点描述</label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                placeholder="站点描述..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">SEO 标题</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                placeholder="SEO 标题..."
              />
            </div>
          </div>
        </section>

        {/* Article Categories */}
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-6">
          <h2 className="text-base font-semibold text-white mb-4">文章分类</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {articleCategories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {c}
                <button onClick={() => removeItem(articleCategories, setArticleCategories, c)} className="text-slate-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(articleCategories, setArticleCategories, newCategory, setNewCategory))}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500/50"
              placeholder="添加分类"
            />
            <button
              onClick={() => addItem(articleCategories, setArticleCategories, newCategory, setNewCategory)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Industry Options */}
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-6">
          <h2 className="text-base font-semibold text-white mb-4">行业选项</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {industryOptions.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {c}
                <button onClick={() => removeItem(industryOptions, setIndustryOptions, c)} className="text-slate-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(industryOptions, setIndustryOptions, newIndustry, setNewIndustry))}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500/50"
              placeholder="添加行业"
            />
            <button
              onClick={() => addItem(industryOptions, setIndustryOptions, newIndustry, setNewIndustry)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Company Scale Options */}
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-6">
          <h2 className="text-base font-semibold text-white mb-4">企业规模选项</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {companyScaleOptions.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {c}
                <button onClick={() => removeItem(companyScaleOptions, setCompanyScaleOptions, c)} className="text-slate-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newScale}
              onChange={(e) => setNewScale(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(companyScaleOptions, setCompanyScaleOptions, newScale, setNewScale))}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500/50"
              placeholder="添加规模"
            />
            <button
              onClick={() => addItem(companyScaleOptions, setCompanyScaleOptions, newScale, setNewScale)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存设置"}
          </button>
        </div>
      </div>
    </div>
  );
}
