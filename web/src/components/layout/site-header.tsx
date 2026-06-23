import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { LayoutPayload } from "@/lib/data/layout";

const FALLBACK_NAV = [
  { href: "/articles", label: "资讯" },
  { href: "/companies", label: "企业" },
  { href: "/events", label: "活动" },
  { href: "/jobs", label: "招聘" },
  { href: "/reports", label: "报告" },
  { href: "/awards", label: "评选" },
];

type Props = {
  navItems?: LayoutPayload["navItems"];
};

export function SiteHeader({ navItems }: Props) {
  const nav = navItems && navItems.length > 0
    ? navItems.map((item) => ({ href: item.link || "/", label: item.title || "" })).filter((n) => n.label)
    : FALLBACK_NAV;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-black/[0.06] bg-[#fbfbfd]/72 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#fbfbfd]/55">
      <div className="relative mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-10 lg:px-12">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="text-[19px] font-semibold tracking-tight text-[#1d1d1f]">
            芯师爷
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73] sm:inline">
            Media
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="主导航"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-[#424245] transition duration-200 ease-out hover:bg-black/[0.04] hover:text-[#1d1d1f] active:scale-[0.98] motion-reduce:active:scale-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="hidden rounded-full p-2.5 text-[#6e6e73] transition duration-200 hover:bg-black/[0.04] hover:text-[#1d1d1f] sm:inline-flex"
            aria-label="搜索"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
          <Link
            href="/enterprise/login"
            className="hidden rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-medium text-white transition duration-200 hover:bg-black active:scale-[0.98] motion-reduce:active:scale-100 md:inline-flex"
          >
            企业登录
          </Link>
          <Link
            href="/enterprise/register"
            className="hidden rounded-full border border-[#d2d2d7] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition duration-200 hover:bg-black/[0.04] active:scale-[0.98] motion-reduce:active:scale-100 md:inline-flex"
          >
            入驻
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
