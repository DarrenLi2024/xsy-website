import Link from "next/link";
import Image from "next/image";
import type { PublicPageSectionPayload } from "@/lib/data/page-sections";

type Props = {
  items: NonNullable<PublicPageSectionPayload>["items"];
};

export function HomeCta({ items }: Props) {
  if (items.length === 0) return null;
  const item = items[0];

  const headline = item?.title || "把品牌叙事，做成可被引用的事实密度";
  const subcopy =
    item?.description ||
    "企业主页、深度稿件、活动与白皮书在同一套视觉与信息架构中交付——让技术、产品与商业判断，以一致的节奏被看见。";
  const primaryLink = item?.link || "/enterprise/login";
  const primaryText = item?.linkText || "企业入驻";

  const extra = (item?.extra as { button2Text?: string; button2Link?: string; kicker?: string; bgImage?: string }) || {};
  const kicker = extra.kicker || "Partnership";
  const secondaryLink = extra.button2Link || "/about";
  const secondaryText = extra.button2Text || "合作与联系";
  const bgImage = extra.bgImage;

  return (
    <section
      id="section-cta"
      className="scroll-mt-32 relative border-t border-black/[0.06] bg-[#1d1d1f] py-24 md:py-32 overflow-hidden"
    >
      {bgImage ? (
        <>
          <Image
            src={bgImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1f]/90 via-[#1d1d1f]/70 to-[#1d1d1f]/95" aria-hidden />
        </>
      ) : null}
      <div className="relative mx-auto max-w-[1200px] px-5 text-center md:px-10 lg:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          {kicker}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-[2rem] font-semibold tracking-tight text-white md:text-[2.5rem]">
          {headline}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/72">
          {subcopy}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={primaryLink}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 text-[17px] font-medium text-[#1d1d1f] transition duration-200 hover:bg-white/90 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            {primaryText}
          </Link>
          <Link
            href={secondaryLink}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/35 px-8 text-[17px] font-medium text-white transition duration-200 hover:bg-white/10 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            {secondaryText}
          </Link>
        </div>
      </div>
    </section>
  );
}
