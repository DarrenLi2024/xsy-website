"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const items = [
  { href: "#section-trending", label: "头条" },
  { href: "#section-feed", label: "资讯" },
  { href: "#section-companies", label: "企业" },
  { href: "#section-events", label: "活动" },
  { href: "#section-reports", label: "报告" },
  { href: "#section-awards", label: "评选" },
  { href: "#section-cta", label: "合作" },
];

export function HomeStickySubNav() {
  return (
    <nav
      aria-label="首页区块"
      className="sticky top-14 z-30 border-b border-black/[0.06] bg-[#fbfbfd]/80 backdrop-blur-md backdrop-saturate-150"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <div className="flex gap-1 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium text-[#6e6e73] transition duration-200 ease-out",
                "hover:bg-black/[0.05] hover:text-[#1d1d1f]",
                "active:scale-[0.97] motion-reduce:active:scale-100",
                "snap-start snap-always",
              )}
              scroll={true}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
