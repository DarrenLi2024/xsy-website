"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable, { StatusBadge } from "@/components/admin/data-table";
import Pagination from "@/components/admin/pagination";
import SearchInput from "@/components/admin/search-input";
import Link from "next/link";
import type { Column } from "@/components/admin/data-table";

const ROLE_LABELS: Record<string, string> = {
  USER: "普通用户",
  ADMIN: "管理员",
  ENTERPRISE: "企业用户",
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";
  const adminRole = searchParams.get("adminRole") || "";

  const [data, setData] = useState<{
    items: Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      adminRole: string | null;
      companyId: string | null;
      createdAt: string;
    }>;
    total: number;
    totalPages: number;
  }>({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    if (role) params.set("role", role);
    if (adminRole) params.set("adminRole", adminRole);

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ items: [], total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [q, page, role, adminRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const columns: Column<(typeof data.items)[number]>[] = [
    {
      key: "name",
      label: "姓名",
      render: (u) => (
        <Link href={`/admin/users/${u.id}`} className="text-white hover:text-cyan-400 transition-colors">
          {u.name || "-"}
        </Link>
      ),
    },
    {
      key: "email",
      label: "邮箱",
      render: (u) => <span className="text-slate-300">{u.email}</span>,
    },
    {
      key: "role",
      label: "角色",
      render: (u) => (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
          {ROLE_LABELS[u.role] || u.role}
        </span>
      ),
    },
    {
      key: "adminRole",
      label: "管理角色",
      render: (u) => (u.adminRole ? <StatusBadge status={u.adminRole} /> : <span className="text-slate-600">-</span>),
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (u) => new Date(u.createdAt).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (u) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/users/${u.id}`}
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
      <PageHeader
        title="用户管理"
        description={`共 ${loading ? "..." : data.total} 个用户`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="搜索邮箱或姓名..." />
        <div className="flex gap-1">
          {["", "USER", "ADMIN", "ENTERPRISE"].map((r) => (
            <Link
              key={r}
              href={r ? `/admin/users?role=${r}` : "/admin/users"}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                role === r || (!role && !r)
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {r ? ROLE_LABELS[r] : "全部"}
            </Link>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="暂无用户"
      />

      <Pagination currentPage={page} totalPages={data.totalPages} basePath="/admin/users" />
    </div>
  );
}
