import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getLayoutDataSafe, emptyLayoutPayload } from "@/lib/data/layout";

/**
 * Marketing Layout — 立即渲染，不阻塞等待布局数据。
 *
 * Header / Footer 各自通过 Suspense 独立流式加载：
 * - 首帧先显示无导航的页面壳，children 自动进入 loading.tsx
 * - 导航数据就绪后自动替换 Suspense fallback
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-editorial flex min-h-screen flex-col bg-[#fbfbfd] text-[#1d1d1f] antialiased selection:bg-black/10">
      <Suspense fallback={<HeaderFallback />}>
        <HeaderLoader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <FooterLoader />
      </Suspense>
    </div>
  );
}

/** 导航数据加载器 — Server Component 在 Suspense 内独自 fetch */
async function HeaderLoader() {
  const { navItems } = await getLayoutDataSafe();
  return <SiteHeader navItems={navItems} />;
}

/** 页脚数据加载器 */
async function FooterLoader() {
  const { footerColumns } = await getLayoutDataSafe();
  return <SiteFooter footerColumns={footerColumns} />;
}

/** 导航未就绪时的占位（高度占位防止布局偏移） */
function HeaderFallback() {
  return <div className="h-14" />;
}
