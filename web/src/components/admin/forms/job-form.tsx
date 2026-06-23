"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

export default function JobForm({
  initialData,
}: {
  initialData?: {
    id: string;
    title: string;
    city: string;
    type: string;
    experience: string;
    education: string;
    salaryMin: number | null;
    salaryMax: number | null;
    description: string;
    requirements: string;
    status: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [type, setType] = useState(initialData?.type || "FULL_TIME");
  const [experience, setExperience] = useState(initialData?.experience || "");
  const [education, setEducation] = useState(initialData?.education || "");
  const [salaryMin, setSalaryMin] = useState(String(initialData?.salaryMin ?? ""));
  const [salaryMax, setSalaryMax] = useState(String(initialData?.salaryMax ?? ""));
  const [description, setDescription] = useState(initialData?.description || "");
  const [requirements, setRequirements] = useState(initialData?.requirements || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title, city: city || null, type,
        experience: experience || null, education: education || null,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        description, requirements: requirements || null,
      };

      const url = isEdit ? `/api/admin/jobs/${initialData.id}` : "/api/admin/jobs";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      const result = await res.json();
      toast("success", isEdit ? "职位已更新" : "职位已创建");
      router.push(`/admin/jobs/${isEdit ? initialData!.id : result.id}`);
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">职位名称</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">职位描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">任职要求</label>
          <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={6}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">职位信息</h3>
          <div>
            <label className="block text-xs font-medium text-slate-500">类型</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              {[{ v: "FULL_TIME", l: "全职" }, { v: "PART_TIME", l: "兼职" }, { v: "INTERNSHIP", l: "实习" }, { v: "CONTRACT", l: "合同" }].map((t) => (
                <option key={t.v} value={t.v}>{t.l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">城市</label>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">经验要求</label>
              <input value={experience} onChange={(e) => setExperience(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="3-5年" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">学历要求</label>
              <input value={education} onChange={(e) => setEducation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="本科及以上" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">薪资下限 (K)</label>
              <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">薪资上限 (K)</label>
              <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving || !title}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : isEdit ? "保存更改" : "发布职位"}
        </button>
      </div>
    </div>
  );
}
