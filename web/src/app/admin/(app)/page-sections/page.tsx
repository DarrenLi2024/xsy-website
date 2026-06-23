"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";

type PageSection = {
  id: string;
  code: string;
  title: string | null;
  type: string;
  sort: number;
  active: boolean;
  _count: { items: number };
};

type ApiResponse = {
  items: PageSection[];
  total: number;
  page: number;
  totalPages: number;
};

const sectionTypeLabels: Record<string, string> = {
  HERO_SLIDE: "Hero轮播",
  TOPIC_CARD: "专题卡片",
  TESTIMONIAL: "声音引语",
  NAV_LINK: "导航链接",
  FOOTER_COLUMN: "页脚列",
  CTA_SECTION: "CTA区",
  TRENDING: "热门资讯",
  ARTICLES_FEED: "最新资讯",
  COMPANIES: "企业展示",
  EVENTS: "活动",
  REPORTS: "报告",
  AWARDS: "评选",
};

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 ${
        checked ? "bg-green-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export default function AdminPageSectionsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const p = searchParams.get("page");
      const type = searchParams.get("type");
      const q = searchParams.get("q");
      if (p) params.set("page", p);
      if (type) params.set("type", type);
      if (q) params.set("q", q);

      const res = await fetch(`/api/admin/page-sections?${params.toString()}`);
      if (res.ok) {
        const data: ApiResponse = await res.json();
        setSections(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast("error", "加载页面区块列表失败");
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSections();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSections]);

  const toggleActive = async (id: string, currentActive: boolean) => {
    setToggling(id);
    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s)),
    );
    try {
      const res = await fetch(`/api/admin/page-sections/${id}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) {
        // Rollback
        setSections((prev) =>
          prev.map((s) => (s.id === id ? { ...s, active: currentActive } : s)),
        );
        toast("error", "切换失败");
      } else {
        toast("success", !currentActive ? "板块已启用" : "板块已停用");
      }
    } catch {
      // Rollback
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: currentActive } : s)),
      );
      toast("error", "网络错误");
    } finally {
      setToggling(null);
    }
  };

  const columns: Column<PageSection>[] = [
    {
      key: "code",
      label: "标识码",
      render: (s) => (
        <Link
          href={`/admin/page-sections/${s.id}`}
          className="text-white hover:text-cyan-400 transition-colors"
        >
          <code className="rounded bg-white/5 px-2 py-0.5 text-xs text-slate-400 font-mono">
            {s.code}
          </code>
        </Link>
      ),
    },
    {
      key: "title",
      label: "标题",
      render: (s) => (
        <span className="text-white">{s.title || "未命名"}</span>
      ),
    },
    {
      key: "type",
      label: "类型",
      render: (s) => (
        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300">
          {sectionTypeLabels[s.type] || s.type}
        </span>
      ),
    },
    {
      key: "items",
      label: "条目数",
      render: (s) => <span className="text-white">{s._count.items}</span>,
    },
    {
      key: "sort",
      label: "排序",
      render: (s) => <span className="text-white">{s.sort}</span>,
    },
    {
      key: "active",
      label: "状态",
      render: (s) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={s.active}
            onChange={() => toggleActive(s.id, s.active)}
            disabled={toggling === s.id}
          />
          <span className={`text-xs ${s.active ? "text-green-400" : "text-slate-500"}`}>
            {s.active ? "启用" : "停用"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (s) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/page-sections/${s.id}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            编辑
          </Link>
          <Link
            href={`/admin/page-sections/${s.id}/items`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            管理条目
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="页面板块管理"
        description={`共 ${total} 个板块`}
        actions={
          <Link
            href="/admin/page-sections/new"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            新建板块
          </Link>
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
            data={sections}
            emptyMessage="暂无页面板块"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/page-sections"
          />
        </>
      )}
    </div>
  );
}
