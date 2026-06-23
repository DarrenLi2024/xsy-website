"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

const PRODUCT_CATEGORIES = [
  "微控制器（MCU）", "FPGA", "CPU处理器", "GPU/AI芯片",
  "存储芯片", "传感器", "功率器件", "模拟芯片",
  "无线连接", "电源管理", "接口芯片", "其他",
];

type ProductData = {
  id?: string;
  name: string;
  category?: string | null;
  description?: string | null;
  parameters?: string | null;
  images?: string | null;
  datasheetUrl?: string | null;
};

export default function ProductForm({
  initialData,
}: {
  initialData?: ProductData;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [parameters, setParameters] = useState(
    initialData?.parameters
      ? typeof initialData.parameters === "string"
        ? initialData.parameters
        : JSON.stringify(initialData.parameters, null, 2)
      : ""
  );
  const [datasheetUrl, setDatasheetUrl] = useState(initialData?.datasheetUrl || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast("error", "产品名称不能为空"); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        category: category || null,
        description: description || null,
        datasheetUrl: datasheetUrl || null,
      };
      if (parameters.trim()) {
        try { body.parameters = JSON.parse(parameters); }
        catch { toast("error", "规格参数 JSON 格式错误"); setSaving(false); return; }
      }

      const url = isEdit ? `/api/enterprise/products/${initialData.id}` : "/api/enterprise/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast("error", "保存失败"); return; }
      toast("success", isEdit ? "产品已更新" : "产品已创建");
      router.push("/enterprise/products");
      router.refresh();
    } catch { toast("error", "操作失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300">产品名称 <span className="text-red-400">*</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">分类</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50">
            <option value="">请选择</option>
            {PRODUCT_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">数据手册</label>
          <input value={datasheetUrl} onChange={(e) => setDatasheetUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">产品描述</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">规格参数（JSON）</label>
        <textarea value={parameters} onChange={(e) => setParameters(e.target.value)} rows={4}
          placeholder='{"工艺": "5nm", "频率": "3.2GHz", "功耗": "15W"}'
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-mono text-white outline-none focus:border-cyan-500/50" />
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={saving || !name.trim()}
          className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建产品"}
        </button>
        <button onClick={() => router.back()}
          className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">
          取消
        </button>
      </div>
    </div>
  );
}
