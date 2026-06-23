import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportById } from "@/lib/data/public-detail";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await getReportById(id);
  return { title: r?.title ?? "报告" };
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await safeQuery(
    () => getReportById(id),
    null,
    "ReportDetailPage",
  );
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <Link href="/reports" className="text-[13px] font-medium text-[var(--accent)] transition hover:opacity-75">
        ← 报告列表
      </Link>
      <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
        {report.title}
      </h1>
      {report.coverImage ? (
        <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-[#f5f5f7]">
          <Image
            src={report.coverImage}
            alt={report.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 720px"
            priority
          />
        </div>
      ) : null}
      {report.description ? (
        <p className="mt-6 text-[17px] leading-relaxed text-[#6e6e73]">{report.description}</p>
      ) : null}
      {report.fileUrl ? (
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-5">
          <a
            href={report.fileUrl}
            className="inline-flex rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
          >
            下载报告
          </a>
          <span className="text-[13px] text-[#86868b]">
            {report.price ? `¥${report.price}` : "免费"}
          </span>
        </div>
      ) : (
        <p className="mt-8 text-[15px] leading-[1.65] text-[#86868b]">
          暂未开放下载，敬请期待。
        </p>
      )}
    </div>
  );
}
