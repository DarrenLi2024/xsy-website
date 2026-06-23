"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

const INDUSTRIES = [
  "IC设计", "制造与封测", "汽车电子", "AI算力芯片",
  "光通信", "EDA", "半导体设备", "医疗电子",
  "互连", "材料", "市场分析", "其他",
];

type CompanyData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  scale: string | null;
  city: string | null;
  socialLinks: unknown | null;
  status: string;
};

export default function CompanyProfileForm({ company }: { company: CompanyData }) {
  const router = useRouter();
  const { toast } = useToast();

  const [logo, setLogo] = useState(company.logo || "");
  const [description, setDescription] = useState(company.description || "");
  const [website, setWebsite] = useState(company.website || "");
  const [industry, setIndustry] = useState(company.industry || "");
  const [scale, setScale] = useState(company.scale || "");
  const [city, setCity] = useState(company.city || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/enterprise/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: logo || null,
          description: description || null,
          website: website || null,
          industry: industry || null,
          scale: scale || null,
          city: city || null,
        }),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      toast("success", "企业信息已更新");
      router.refresh();
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">企业名称</label>
          <p className="mt-1 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-lg text-slate-400">
            {company.name}
          </p>
          <p className="mt-1 text-xs text-slate-600">企业名称不可自行修改，如需变更请联系运营</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Logo URL</label>
          <input value={logo} onChange={(e) => setLogo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">企业简介</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">网站</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-white">基本信息</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">所属行业</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                <option value="">请选择</option>
                {INDUSTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">规模</label>
              <select value={scale} onChange={(e) => setScale(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                <option value="">请选择</option>
                {["少于50人", "50-150人", "150-500人", "500-1000人", "1000-5000人", "5000人以上"].map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">城市</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : "保存更改"}
        </button>
      </div>
    </div>
  );
}
