"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/admin/toast";

type PageSectionItem = {
  id: string;
  sectionId: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
  linkText: string | null;
  sort: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type SectionInfo = {
  id: string;
  code: string;
  title: string | null;
  type: string;
  sort: number;
  active: boolean;
  _count: { items: number };
};

export default function PageSectionItemsPage() {
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [section, setSection] = useState<SectionInfo | null>(null);
  const [items, setItems] = useState<PageSectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionRes, itemsRes] = await Promise.all([
        fetch(`/api/admin/page-sections/${id}`),
        fetch(`/api/admin/page-sections/${id}/items`),
      ]);

      if (sectionRes.ok) {
        setSection(await sectionRes.json());
      }
      if (itemsRes.ok) {
        setItems(await itemsRes.json());
      }
    } catch {
      toast("error", "加载区块内容失败");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const columns: Column<PageSectionItem>[] = [
    {
      key: "sort",
      label: "排序",
      render: (i) => <span className="text-white">{i.sort}</span>,
    },
    {
      key: "title",
      label: "标题",
      render: (i) => (
        <span className="text-white">{i.title || "未命名"}</span>
      ),
    },
    {
      key: "subtitle",
      label: "副标题",
      render: (i) => (
        <span className="text-xs text-slate-400 max-w-[200px] truncate block">
          {i.subtitle || "-"}
        </span>
      ),
    },
    {
      key: "image",
      label: "图片",
      render: (i) =>
        i.image ? (
          <Image
            src={i.image}
            alt=""
            width={64}
            height={40}
            className="h-10 w-16 rounded-md object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-slate-600">无</span>
        ),
    },
    {
      key: "link",
      label: "链接",
      render: (i) =>
        i.link ? (
          <a
            href={i.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline text-xs max-w-[180px] truncate block"
          >
            {i.linkText || i.link}
          </a>
        ) : (
          <span className="text-xs text-slate-600">-</span>
        ),
    },
    {
      key: "active",
      label: "状态",
      render: (i) =>
        i.active ? (
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
      render: (i) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/page-sections/items/${i.id}`}
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
        <Link
          href="/admin/page-sections"
          className="text-sm text-cyan-400 hover:underline"
        >
          &larr; 返回板块列表
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link
          href={`/admin/page-sections/${id}`}
          className="text-sm text-cyan-400 hover:underline"
        >
          编辑板块
        </Link>
      </div>

      <PageHeader
        title={`条目管理: ${section ? (section.title || section.code) : "加载中..."}`}
        description={section ? `共 ${section._count.items} 个条目` : "加载中..."}
        actions={
          <Link
            href={`/admin/page-sections/${id}/items/new`}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            添加条目
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
          data={items}
          emptyMessage="暂无条目，请添加"
        />
      )}
    </div>
  );
}
