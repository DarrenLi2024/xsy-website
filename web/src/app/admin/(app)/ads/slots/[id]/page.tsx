"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/admin/toast";

type Ad = {
  id: string;
  title: string;
  link: string;
  image: string | null;
  sort: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  active: boolean;
  slotId: string;
  createdAt: string;
  updatedAt: string;
  slot: { id: string; title: string; code: string };
};

type ApiResponse = {
  items: Ad[];
  total: number;
  page: number;
  totalPages: number;
};

type SlotInfo = {
  id: string;
  code: string;
  title: string;
  active: boolean;
  _count: { ads: number };
};

export default function SlotAdsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = parseInt(searchParams.get("page") || "1");

      const [slotRes, adsRes] = await Promise.all([
        fetch(`/api/admin/ads/slots/${id}`),
        fetch(`/api/admin/ads?slotId=${id}&page=${currentPage}`),
      ]);

      if (slotRes.ok) {
        setSlot(await slotRes.json());
      }
      if (adsRes.ok) {
        const data: ApiResponse = await adsRes.json();
        setAds(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast("error", "加载广告数据失败");
    } finally {
      setLoading(false);
    }
  }, [id, searchParams, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const columns: Column<Ad>[] = [
    {
      key: "title",
      label: "广告标题",
      render: (a) => <span className="text-white">{a.title}</span>,
    },
    {
      key: "link",
      label: "链接",
      render: (a) => (
        <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs max-w-[200px] truncate block">
          {a.link}
        </a>
      ),
    },
    {
      key: "sort",
      label: "排序",
      render: (a) => <span className="text-white">{a.sort}</span>,
    },
    {
      key: "impressions",
      label: "展示",
      render: (a) => a.impressions.toLocaleString(),
    },
    {
      key: "clicks",
      label: "点击",
      render: (a) => a.clicks.toLocaleString(),
    },
    {
      key: "dateRange",
      label: "投放期间",
      render: (a) =>
        `${new Date(a.startDate).toLocaleDateString("zh-CN")} ~ ${new Date(a.endDate).toLocaleDateString("zh-CN")}`,
    },
    {
      key: "active",
      label: "状态",
      render: (a) =>
        a.active ? (
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
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (a) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/ads/new?id=${a.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/ads" className="text-sm text-cyan-400 hover:underline">
          &larr; 返回广告管理
        </Link>
      </div>

      <PageHeader
        title={slot ? `${slot.title}` : "加载中..."}
        description={
          slot
            ? `标识码: ${slot.code} · 共 ${total} 个广告 · ${slot.active ? "启用中" : "已停用"}`
            : "加载中..."
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={ads}
            emptyMessage="暂无广告，请新建"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/admin/ads/slots/${id}`}
          />
        </>
      )}
    </div>
  );
}
