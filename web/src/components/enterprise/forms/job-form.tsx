"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

type JobData = {
  id?: string;
  title: string;
  city?: string | null;
  type: string;
  experience?: string | null;
  education?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  description: string;
  requirements?: string | null;
  status?: string;
};

const JOB_TYPES = [
  { value: "FULL_TIME", label: "全职" },
  { value: "PART_TIME", label: "兼职" },
  { value: "INTERNSHIP", label: "实习" },
  { value: "CONTRACT", label: "合同" },
];

export default function JobForm({
  initialData,
}: {
  initialData?: JobData;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [type, setType] = useState(initialData?.type || "FULL_TIME");
  const [experience, setExperience] = useState(initialData?.experience || "");
  const [education, setEducation] = useState(initialData?.education || "");
  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin?.toString() || "");
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [requirements, setRequirements] = useState(initialData?.requirements || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) { toast("error", "职位名称不能为空"); return; }
    if (!description.trim()) { toast("error", "职位描述不能为空"); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        city: city || null,
        type,
        experience: experience || null,
        education: education || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        description: description.trim(),
        requirements: requirements || null,
      };

      const url = isEdit ? `/api/enterprise/jobs/${initialData.id}` : "/api/enterprise/jobs";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      toast("success", isEdit ? "职位已更新" : "职位已创建");
      router.push("/enterprise/jobs");
      router.refresh();
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-300">职位名称 <span className="text-red-400">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">工作类型</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            {JOB_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">城市</label>
          <input value={city} onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">经验要求</label>
          <input value={experience} onChange={(e) => setExperience(e.target.value)}
            placeholder="如：3-5年"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">学历要求</label>
          <input value={education} onChange={(e) => setEducation(e.target.value)}
            placeholder="如：本科及以上"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">薪资范围（最低）</label>
          <input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
            type="number" placeholder="如：15000"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">薪资范围（最高）</label>
          <input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
            type="number" placeholder="如：30000"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">职位描述 <span className="text-red-400">*</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">任职要求</label>
        <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={saving || !title.trim() || !description.trim()}
          className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : isEdit ? "保存更改" : "发布职位"}
        </button>
        <button onClick={() => router.back()}
          className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">
          取消
        </button>
      </div>
    </div>
  );
}
