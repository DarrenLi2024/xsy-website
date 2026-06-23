import Link from "next/link";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  award: HomePagePayload["award"];
};

export function HomeAwards({ award }: Props) {
  if (!award) return null;
  return (
    <section id="section-awards" className="scroll-mt-32 bg-[#fbfbfd] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:grid md:grid-cols-2 md:items-stretch">
          <div className="border-b border-black/[0.06] p-8 md:border-b-0 md:border-r md:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
              Awards
            </p>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
              {award?.title ?? "硬核芯评选"}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#6e6e73]">
              {award?.summary ??
                "以清晰规则与可验证流程，记录每一年值得被记住的产品与团队。"}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/awards"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1d1d1f] px-7 text-[15px] font-medium text-white transition duration-200 hover:bg-black active:scale-[0.98] motion-reduce:active:scale-100"
              >
                了解规则
              </Link>
              <Link
                href="/enterprise/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black/[0.12] bg-transparent px-7 text-[15px] font-medium text-[#1d1d1f] transition duration-200 hover:bg-black/[0.04] active:scale-[0.98] motion-reduce:active:scale-100"
              >
                企业参评
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-[#f5f5f7] p-10 md:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
              Year
            </p>
            <p className="mt-4 text-[4.5rem] font-semibold leading-none tracking-tight text-[#1d1d1f] md:text-[5.5rem]">
              {award?.year ?? "—"}
            </p>
            <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-[#6e6e73]">
              评选周期、提名与投票机制可在运营后台配置；此处为品牌级入口展示。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
