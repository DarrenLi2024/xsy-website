import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getLayoutDataSafe } from "@/lib/data/layout";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navItems, footerColumns } = await getLayoutDataSafe();

  return (
    <div className="theme-editorial flex min-h-screen flex-col bg-[#fbfbfd] text-[#1d1d1f] antialiased selection:bg-black/10">
      <SiteHeader navItems={navItems} />
      <main className="flex-1">{children}</main>
      <SiteFooter footerColumns={footerColumns} />
    </div>
  );
}
