import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAwardCampaignBySlug } from "@/lib/data/public-detail";
import VoteWidget from "@/components/vote-widget";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getAwardCampaignBySlug(slug);
  return { title: c?.title ?? "评选" };
}

export default async function AwardDetailPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await safeQuery(
    () => getAwardCampaignBySlug(slug),
    null,
    "AwardDetailPage",
  );
  if (!campaign) notFound();

  const isActive = campaign.active && new Date(campaign.endDate) > new Date();

  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <Link href="/awards" className="text-[13px] font-medium text-[var(--accent)] transition hover:opacity-75">
        ← 评选列表
      </Link>
      <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
        {campaign.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-[15px] text-[#6e6e73]">
          {campaign.year} 届 · {campaign.startDate.toLocaleDateString("zh-CN")} —{" "}
          {campaign.endDate.toLocaleDateString("zh-CN")}
        </p>
        {isActive ? (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[12px] font-medium text-emerald-700">
            进行中
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-0.5 text-[12px] font-medium text-[#86868b]">
            已结束
          </span>
        )}
      </div>
      {campaign.summary ? (
        <p className="mt-6 text-[15px] leading-[1.65] text-[#424245]">{campaign.summary}</p>
      ) : null}

      <div className="mt-10">
        <VoteWidget campaignId={campaign.id} />
      </div>

      <p className="mt-8 text-[13px] text-[#86868b]">
        支持企业的评选活动，每一票都代表您的认可。
      </p>
    </div>
  );
}
