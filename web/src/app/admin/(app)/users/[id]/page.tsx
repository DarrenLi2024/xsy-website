"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";

const ROLE_OPTIONS = [
  { value: "USER", label: "普通用户" },
  { value: "ADMIN", label: "管理员" },
  { value: "ENTERPRISE", label: "企业用户" },
];

const ADMIN_ROLE_OPTIONS = [
  { value: "", label: "无" },
  { value: "SUPER_ADMIN", label: "超级管理员" },
  { value: "CONTENT_EDITOR", label: "内容编辑" },
  { value: "BUSINESS_OPS", label: "商务运营" },
  { value: "REVIEWER", label: "审核员" },
];

type UserData = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  adminRole: string | null;
  companyId: string | null;
  createdAt: string;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [adminRole, setAdminRole] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) {
          toast("error", "用户不存在");
          router.push("/admin/users");
          return;
        }
        const data: UserData = await res.json();
        setUser(data);
        setEmail(data.email);
        setName(data.name || "");
        setRole(data.role);
        setAdminRole(data.adminRole || "");
      } catch {
        toast("error", "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, toast]);

  const save = async () => {
    if (!email) {
      toast("error", "邮箱不能为空");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = { email, name: name || null, role, adminRole: adminRole || null };
      if (password) body.password = password;

      const res = await fetch(`/api/admin/users/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast("error", err.error || "保存失败");
        return;
      }

      toast("success", "用户已更新");
      router.push("/admin/users");
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

  if (!user) return null;

  return (
    <div>
      <PageHeader title={`编辑用户: ${user.name || user.email}`} description="修改用户信息和角色" />

      <div className="mb-6 text-xs text-slate-500">
        ID: {user.id} · 创建于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
      </div>

      <div className="max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300">姓名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="用户姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">邮箱 *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">
            新密码
            <span className="ml-2 text-xs text-slate-500">留空则不修改</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            placeholder="至少 6 位"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">角色</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {role === "ADMIN" && (
          <div>
            <label className="block text-sm font-medium text-slate-300">管理角色</label>
            <select
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {ADMIN_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">仅管理员角色用户需要设置此字段</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存更改"}
          </button>
          <button
            onClick={() => router.push("/admin/users")}
            className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
