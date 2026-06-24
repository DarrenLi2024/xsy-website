import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Geist_Mono } from "next/font/google";
import { SITE_TAGLINE } from "@/lib/brand/editorial-copy";
import "./globals.css";

const noto = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "芯师爷 — 半导体产业垂直媒体与服务平台",
    template: "%s | 芯师爷",
  },
  description: `${SITE_TAGLINE}。深度内容、企业品牌、活动与白皮书，服务中国集成电路产业关键决策者。`,
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "芯师爷",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${noto.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
