"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

export default function EventForm({
  initialData,
}: {
  initialData?: {
    id: string;
    title: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    location: string;
    coverImage: string;
    capacity: number | null;
    registrationDeadline: string | null;
    status: string;
    isFeatured: boolean;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "CONFERENCE");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [capacity, setCapacity] = useState(String(initialData?.capacity ?? ""));
  const [registrationDeadline, setRegistrationDeadline] = useState(initialData?.registrationDeadline || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title,
        description: description || null,
        type,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        location: location || null,
        coverImage: coverImage || null,
        capacity: capacity ? parseInt(capacity) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        isFeatured,
      };

      const url = isEdit ? `/api/admin/events/${initialData.id}` : "/api/admin/events";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast("error", err.error || (isEdit ? "更新失败" : "创建失败"));
        return;
      }

      const result = await res.json();
      toast("success", isEdit ? "活动已更新" : "活动已创建");
      router.push(`/admin/events/${isEdit ? initialData!.id : result.id}`);
    } catch {
      toast("error", "操作失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">活动标题</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">开始时间</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">结束时间</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">地点</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">封面图 URL</label>
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">活动设置</h3>
          <div>
            <label className="block text-xs font-medium text-slate-500">类型</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              {["EXHIBITION", "CONFERENCE", "WEBINAR", "SALON", "WORKSHOP"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">容量</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">截止报名</label>
            <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-white/20 bg-white/5" /> 设为推荐
          </label>
        </div>
        <button onClick={save} disabled={saving || !title}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建活动"}
        </button>
      </div>
    </div>
  );
}
