"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "资讯" },
  { href: "/companies", label: "企业" },
  { href: "/events", label: "活动" },
  { href: "/jobs", label: "招聘" },
  { href: "/reports", label: "报告" },
  { href: "/awards", label: "评选" },
  { href: "/search", label: "搜索" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="rounded-full p-2.5 text-[#1d1d1f] transition hover:bg-black/[0.05] active:scale-[0.96] motion-reduce:active:scale-100"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
      </button>
      <div
        id="mobile-menu"
        className={cn(
          "absolute left-0 right-0 top-full z-50 border-b border-black/[0.06] bg-[#fbfbfd]/95 backdrop-blur-xl transition-[opacity,visibility] duration-200 ease-out",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
      >
        <nav className="flex max-h-[70vh] flex-col gap-0.5 px-4 py-4" aria-label="移动端主导航">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-[#1d1d1f] transition hover:bg-black/[0.04]"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/enterprise/login"
            className="mt-3 rounded-xl bg-[#1d1d1f] px-3 py-3 text-center text-[15px] font-medium text-white transition hover:bg-black"
            onClick={() => setOpen(false)}
          >
            企业登录
          </Link>
        </nav>
      </div>
    </div>
  );
}
