"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

type Company = { id: string; name: string };

export default function ProductForm({
  initialData,
  companies,
}: {
  initialData?: {
    id: string;
    companyId: string;
    name: string;
    category: string | null;
    description: string | null;
    status: string;
    sort: number;
  };
  companies: Company[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [companyId, setCompanyId] = useState(initialData?.companyId || "");
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status] = useState(initialData?.status || "APPROVED");
  const [sort, setSort] = useState(initialData?.sort ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        companyId,
        name,
        category: category || null,
        description: description || null,
        status,
        sort,
      };

      const url = isEdit
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
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
      toast("success", isEdit ? "产品已更新" : "产品已创建");
      router.push(`/admin/products/${isEdit ? initialData!.id : result.id}`);
      router.refresh();
    } catch {
      toast("error", "操作失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">
            产品名称 <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500/50"
            placeholder="产品名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="产品描述..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-white">产品信息</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">
                所属企业 <span className="text-red-400">*</span>
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">请选择企业</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">分类</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                placeholder="例如: MCU, 传感器"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">排序</label>
              <input
                type="number"
                value={sort}
                onChange={(e) => setSort(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={save}
            disabled={saving || !name || !companyId}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : isEdit ? "保存更改" : "创建产品"}
          </button>
        </div>
      </div>
    </div>
  );
}
