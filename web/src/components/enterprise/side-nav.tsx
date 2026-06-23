"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Package,
  Briefcase,
  FileText,
  Send,
  Settings,
  ChevronDown,
  X,
  Menu,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const ALL_GROUPS: NavGroup[] = [
  {
    label: "概览",
    items: [{ href: "/enterprise/dashboard", label: "控制台", icon: LayoutDashboard }],
  },
  {
    label: "企业信息",
    items: [{ href: "/enterprise/profile", label: "企业资料", icon: Building2 }],
  },
  {
    label: "业务管理",
    items: [
      { href: "/enterprise/products", label: "产品管理", icon: Package },
      { href: "/enterprise/jobs", label: "职位管理", icon: Briefcase },
    ],
  },
  {
    label: "内容",
    items: [
      { href: "/enterprise/articles", label: "我的文章", icon: FileText },
      { href: "/enterprise/soft-articles", label: "软文发布", icon: Send },
    ],
  },
  {
    label: "账号",
    items: [{ href: "/enterprise/settings", label: "账号设置", icon: Settings }],
  },
];

export default function SideNav() {
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

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 pb-6">
      {ALL_GROUPS.map((group) => {
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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 border-r border-white/10 bg-slate-900/95 backdrop-blur-xl transition-transform md:relative md:block md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Enterprise
            </p>
            <p className="mt-1 text-lg font-bold text-white">企业工作台</p>
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
