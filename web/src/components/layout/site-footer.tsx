import Link from "next/link";
import type { LayoutPayload } from "@/lib/data/layout";

const FALLBACK_FOOTER_COLUMNS = [
  {
    header: "内容",
    links: [
      { label: "资讯", href: "/articles" },
      { label: "报告", href: "/reports" },
      { label: "评选", href: "/awards" },
    ],
  },
  {
    header: "服务",
    links: [
      { label: "企业名录", href: "/companies" },
      { label: "活动", href: "/events" },
      { label: "招聘", href: "/jobs" },
    ],
  },
  {
    header: "管理",
    links: [
      { label: "关于我们", href: "/about" },
      { label: "运营登录", href: "/admin/login" },
    ],
  },
];

type Props = {
  footerColumns?: LayoutPayload["footerColumns"];
};

export function SiteFooter({ footerColumns }: Props) {
  const columns = footerColumns && footerColumns.length > 0
    ? footerColumns.map((col) => {
        const extra = col.extra as Record<string, unknown> | null;
        const links = extra?.links as { label: string; href: string }[] | undefined;
        return {
          header: col.title || "栏目",
          links: (links || []).filter((l) => l.label && l.href),
        };
      }).filter((c) => c.links.length > 0)
    : FALLBACK_FOOTER_COLUMNS;

  return (
    <footer className="border-t border-black/[0.06] bg-[#f5f5f7] py-16 text-[13px] text-[#6e6e73]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 md:grid-cols-4 md:px-10 lg:px-12">
        <div>
          <p className="text-[15px] font-semibold text-[#1d1d1f]">芯师爷</p>
          <p className="mt-3 max-w-xs leading-relaxed">
            面向半导体产业的编辑型媒体与企业服务入口。
          </p>
        </div>
        {columns.map((col, i) => (
          <div key={i}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
              {col.header}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#424245] transition duration-200 hover:text-[#1d1d1f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-14 max-w-[1200px] px-5 text-center text-[11px] text-[#86868b] md:px-10 lg:px-12">
        &copy; {new Date().getFullYear()} 芯师爷. 保留所有权利。
      </p>
    </footer>
  );
}
