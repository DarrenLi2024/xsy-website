"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Package,
  Calendar,
  Briefcase,
  BookOpen,
  Trophy,
  Megaphone,
  Users,
  Settings,
  ClipboardList,
  Layout,
  ChevronDown,
  X,
  Menu,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@prisma/client";
import { cn } from "@/lib/utils";

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: AdminRole[];
};

const ALL_GROUPS: NavGroup[] = [
  {
    label: "概览",
    items: [{ href: "/admin/dashboard", label: "控制台", icon: LayoutDashboard }],
  },
  {
    label: "内容管理",
    items: [
      { href: "/admin/articles", label: "文章", icon: FileText, roles: ["SUPER_ADMIN", "CONTENT_EDITOR", "REVIEWER"] },
      { href: "/admin/events", label: "活动", icon: Calendar, roles: ["SUPER_ADMIN", "CONTENT_EDITOR", "BUSINESS_OPS"] },
      { href: "/admin/reports", label: "报告", icon: BookOpen, roles: ["SUPER_ADMIN", "CONTENT_EDITOR"] },
      { href: "/admin/awards", label: "评选", icon: Trophy, roles: ["SUPER_ADMIN", "CONTENT_EDITOR", "BUSINESS_OPS"] },
    ],
  },
  {
    label: "企业管理",
    items: [
      { href: "/admin/companies", label: "企业", icon: Building2, roles: ["SUPER_ADMIN", "BUSINESS_OPS", "REVIEWER"] },
      { href: "/admin/products", label: "产品", icon: Package, roles: ["SUPER_ADMIN", "BUSINESS_OPS"] },
    ],
  },
  {
    label: "招聘管理",
    items: [
      { href: "/admin/jobs", label: "职位", icon: Briefcase, roles: ["SUPER_ADMIN", "BUSINESS_OPS"] },
    ],
  },
  {
    label: "页面管理",
    items: [
      { href: "/admin/page-sections", label: "页面板块", icon: Layout, roles: ["SUPER_ADMIN", "CONTENT_EDITOR"] },
    ],
  },
  {
    label: "广告管理",
    items: [
      { href: "/admin/ads", label: "广告位", icon: Megaphone, roles: ["SUPER_ADMIN", "BUSINESS_OPS"] },
    ],
  },
  {
    label: "系统管理",
    items: [
      { href: "/admin/users", label: "用户", icon: Users, roles: ["SUPER_ADMIN"] },
      { href: "/admin/settings", label: "设置", icon: Settings, roles: ["SUPER_ADMIN"] },
      { href: "/admin/logs", label: "操作日志", icon: ClipboardList },
    ],
  },
];

export default function SideNav({
  adminRole,
}: {
  adminRole: AdminRole | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const filterGroups = ALL_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => {
      if (!item.roles) return true;
      if (!adminRole) return false;
      return item.roles.includes(adminRole);
    }),
  })).filter((g) => g.items.length > 0);

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 pb-6">
      {filterGroups.map((group) => {
        const collapsed = collapsedGroups.has(group.label);
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-300"
            >
              {group.label}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
            </button>
            {!collapsed && (
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-white/10 text-white before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-cyan-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 rounded-lg border border-white/10 bg-slate-900 p-2 text-slate-400 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 border-r border-white/10 bg-slate-900/95 backdrop-blur-xl transition-transform md:relative md:block md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Admin
            </p>
            <p className="mt-1 text-lg font-bold text-white">运营后台</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navContent}
        <div className="border-t border-white/10 px-3 pt-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300"
          >
            <ExternalLink className="h-4 w-4" />
            返回前台
          </Link>
        </div>
      </aside>
    </>
  );
}
