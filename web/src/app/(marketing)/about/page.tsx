import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_ESSENCE, SITE_TAGLINE } from "@/lib/brand/editorial-copy";

export const metadata: Metadata = {
  title: "关于我们",
  description: SITE_TAGLINE,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">About</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">
        关于芯师爷
      </h1>
      <p className="mt-6 text-[17px] leading-[1.65] text-[#424245]">{BRAND_ESSENCE}</p>
      <h2 className="mt-14 text-[1.25rem] font-semibold text-[#1d1d1f]" id="contact">
        商务与合作
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#6e6e73]">
        媒体合作、企业入驻与品牌项目，欢迎通过官方渠道联络（此处可替换为真实邮箱与表单）。
      </p>
      <p className="mt-10">
        <Link href="/" className="text-[15px] font-medium text-[var(--accent)] transition hover:opacity-75">
          返回首页
        </Link>
      </p>
    </div>
  );
}
