"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/admin/toast";

type AdSlot = {
  id: string;
  code: string;
  title: string;
  active: boolean;
  createdAt: string;
  _count: { ads: number };
};

export default function AdminAdsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const page = searchParams.get("page");
      if (page) params.set("page", page);

      const res = await fetch(`/api/admin/ads/slots?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch {
      toast("error", "加载广告位列表失败");
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSlots();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSlots]);

  const columns: Column<AdSlot>[] = [
    {
      key: "title",
      label: "广告位名称",
      render: (s) => (
        <Link href={`/admin/ads/slots/${s.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {s.title}
        </Link>
      ),
    },
    {
      key: "code",
      label: "标识码",
      render: (s) => <code className="rounded bg-white/5 px-2 py-0.5 text-xs text-slate-400 font-mono">{s.code}</code>,
    },
    {
      key: "ads",
      label: "广告数",
      render: (s) => <span className="text-white">{s._count.ads}</span>,
    },
    {
      key: "active",
      label: "状态",
      render: (s) =>
        s.active ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-400">
            <Check className="h-3 w-3" /> 启用
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <X className="h-3 w-3" /> 停用
          </span>
        ),
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (s) => new Date(s.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (s) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/ads/slots/${s.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            管理广告
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="广告管理"
        description={`共 ${slots.length} 个广告位`}
        actions={
          <Link
            href="/admin/ads/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建广告
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={slots}
          emptyMessage="暂无广告位"
        />
      )}
    </div>
  );
}
