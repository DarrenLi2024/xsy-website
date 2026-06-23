"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";

type Slot = { id: string; code: string; title: string };

export default function NewAdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { toast } = useToast();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [sort, setSort] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isEdit = !!editId;

  useEffect(() => {
    async function init() {
      try {
        const [slotsRes] = await Promise.all([fetch("/api/admin/ads/slots")]);
        const slotsData: Slot[] = await slotsRes.json();
        setSlots(slotsData);

        if (editId) {
          const adRes = await fetch(`/api/admin/ads/${editId}`);
          if (adRes.ok) {
            const ad = await adRes.json();
            setSlotId(ad.slotId);
            setTitle(ad.title);
            setImage(ad.image || "");
            setLink(ad.link);
            setSort(String(ad.sort));
            setStartDate(ad.startDate ? ad.startDate.slice(0, 10) : "");
            setEndDate(ad.endDate ? ad.endDate.slice(0, 10) : "");
            setActive(ad.active);
          }
        } else if (slotsData.length > 0) {
          setSlotId(slotsData[0].id);
        }
      } catch {
        toast("error", "加载失败");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [editId, toast]);

  const save = async () => {
    if (!title || !link || !startDate || !endDate || !slotId) {
      toast("error", "请填写必填字段");
      return;
    }

    setSaving(true);
    try {
      const body = {
        slotId,
        title,
        image,
        link,
        sort: parseInt(sort) || 0,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        active,
      };

      const url = isEdit ? `/api/admin/ads/${editId}` : "/api/admin/ads";
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

      toast("success", isEdit ? "广告已更新" : "广告已创建");
      router.push(`/admin/ads/slots/${slotId}`);
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
      <PageHeader title={isEdit ? "编辑广告" : "新建广告"} description={isEdit ? "修改广告信息" : "创建一个新的广告"} />

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300">广告位 *</label>
          <select
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          >
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">标题 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="广告标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">图片 URL</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="https://..."
          />
          {image && (
            <Image
              src={image}
              alt=""
              width={320}
              height={96}
              className="mt-2 h-24 w-full max-w-xs rounded-lg object-cover"
              unoptimized
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">链接 *</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="https://..."
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">开始日期 *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">结束日期 *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
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
            disabled={saving}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : isEdit ? "保存更改" : "创建广告"}
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
