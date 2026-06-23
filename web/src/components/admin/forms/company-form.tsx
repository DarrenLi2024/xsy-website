"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/admin/toast";

export function CompanyReviewForm({
  company,
}: {
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    website: string;
    industry: string;
    scale: string;
    city: string;
    status: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const changeStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { toast("error", "操作失败"); return; }
      toast("success", newStatus === "APPROVED" ? "已通过" : "已驳回");
      router.push("/admin/companies");
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center gap-4">
          {company.logo && (
            <Image
              src={company.logo}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl object-cover"
              unoptimized
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-white">{company.name}</h2>
            <p className="text-sm text-slate-400">{company.slug}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">行业：</span><span className="text-slate-300">{company.industry || "-"}</span></div>
          <div><span className="text-slate-500">城市：</span><span className="text-slate-300">{company.city || "-"}</span></div>
          <div><span className="text-slate-500">规模：</span><span className="text-slate-300">{company.scale || "-"}</span></div>
          <div><span className="text-slate-500">网站：</span><a href={company.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{company.website || "-"}</a></div>
        </div>
        {company.description && <p className="text-sm text-slate-400 leading-relaxed">{company.description}</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={() => changeStatus("APPROVED")} disabled={saving}
          className="flex-1 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50">
          {saving ? "处理中..." : "审核通过"}
        </button>
        <button onClick={() => changeStatus("REJECTED")} disabled={saving}
          className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
          驳回
        </button>
      </div>
    </div>
  );
}

export default function CompanyForm({
  initialData,
}: {
  initialData?: {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    industry: string | null;
    scale: string | null;
    city: string | null;
    status: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [scale, setScale] = useState(initialData?.scale || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [status, setStatus] = useState(initialData?.status || "PENDING");
  const [saving, setSaving] = useState(false);

  const save = async (targetStatus?: string) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name, logo: logo || null, description: description || null,
        website: website || null, industry: industry || null,
        scale: scale || null, city: city || null,
      };
      if (targetStatus) body.status = targetStatus;

      const url = isEdit ? `/api/admin/companies/${initialData.id}` : "/api/admin/companies";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      const result = await res.json();
      toast("success", isEdit ? "企业已更新" : "企业已创建");
      router.push(`/admin/companies/${isEdit ? initialData!.id : result.id}`);
      router.refresh();
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  const changeStatus = async (newStatus: string) => {
    if (!initialData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/companies/${initialData.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { toast("error", "状态更新失败"); return; }
      setStatus(newStatus);
      toast("success", "状态已更新");
      router.refresh();
    } catch { toast("error", "状态更新失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">企业名称 <span className="text-red-400">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Logo URL</label>
          <input value={logo} onChange={(e) => setLogo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
          {logo && (
            <Image
              src={logo}
              alt=""
              width={64}
              height={64}
              className="mt-2 h-16 w-16 rounded-lg object-cover"
              unoptimized
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
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
                {["IC设计", "制造与封测", "汽车电子", "AI算力芯片", "光通信", "EDA", "半导体设备", "医疗电子", "互连", "材料", "市场分析", "其他"].map((c) => (<option key={c} value={c}>{c}</option>))}
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
        <div className="space-y-2">
          {isEdit && status === "PENDING" && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => changeStatus("APPROVED")} disabled={saving}
                className="flex-1 rounded-xl border border-green-500/30 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/10 disabled:opacity-50">审核通过</button>
              <button onClick={() => changeStatus("REJECTED")} disabled={saving}
                className="flex-1 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50">驳回</button>
            </div>
          )}
          {isEdit && status === "APPROVED" && (
            <button onClick={() => changeStatus("SUSPENDED")} disabled={saving}
              className="w-full rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50">冻结</button>
          )}
          {isEdit && status === "SUSPENDED" && (
            <button onClick={() => changeStatus("APPROVED")} disabled={saving}
              className="w-full rounded-xl border border-green-500/30 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/10 disabled:opacity-50">恢复</button>
          )}
          <button onClick={() => save()} disabled={saving || !name}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
            {saving ? "保存中..." : isEdit ? "保存更改" : "创建企业"}
          </button>
          {!isEdit && (
            <button onClick={() => save("APPROVED")} disabled={saving || !name}
              className="w-full rounded-xl border border-cyan-500/30 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50">创建并直接通过</button>
          )}
        </div>
      </div>
    </div>
  );
}
