"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";

type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  createdAt: string;
};

type ApiResponse = {
  items: Registration[];
  total: number;
  page: number;
  totalPages: number;
};

export default function EventRegistrationsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [eventTitle, setEventTitle] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = parseInt(searchParams.get("page") || "1");

      const [eventRes, regRes] = await Promise.all([
        fetch(`/api/admin/events/${id}`),
        fetch(`/api/admin/events/${id}/registrations?page=${currentPage}`),
      ]);

      if (eventRes.ok) {
        const event = await eventRes.json();
        setEventTitle(event.title);
      }
      if (regRes.ok) {
        const data: ApiResponse = await regRes.json();
        setRegistrations(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast("error", "加载报名列表失败");
    } finally {
      setLoading(false);
    }
  }, [id, searchParams, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const columns: Column<Registration>[] = [
    { key: "name", label: "姓名" },
    { key: "email", label: "邮箱" },
    { key: "phone", label: "电话", render: (r) => r.phone || "-" },
    { key: "company", label: "公司", render: (r) => r.company || "-" },
    { key: "position", label: "职位", render: (r) => r.position || "-" },
    {
      key: "createdAt",
      label: "报名时间",
      render: (r) => new Date(r.createdAt).toLocaleString("zh-CN"),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`报名列表: ${eventTitle || "加载中..."}`}
        description={`共 ${total} 人报名`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/admin/events/${id}`}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
            >
              返回编辑
            </Link>
            <a
              href={`/api/admin/events/${id}/registrations?format=csv`}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              导出 CSV
            </a>
          </div>
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
            data={registrations}
            emptyMessage="暂无报名记录"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/admin/events/${id}/registrations`}
          />
        </>
      )}
    </div>
  );
}
