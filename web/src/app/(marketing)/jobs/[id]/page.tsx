import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJobById } from "@/lib/data/public-detail";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const j = await getPublishedJobById(id);
  return { title: j?.title ?? "职位" };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await safeQuery(
    () => getPublishedJobById(id),
    null,
    "JobDetailPage",
  );
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <Link href="/jobs" className="text-[13px] font-medium text-[var(--accent)] transition hover:opacity-75">
        ← 招聘列表
      </Link>
      <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
        {job.title}
      </h1>
      <p className="mt-3 text-[15px] text-[#6e6e73]">
        <Link href={`/companies/${job.company.slug}`} className="font-medium text-[var(--accent)] transition hover:opacity-75">
          {job.company.name}
        </Link>
        {job.city ? ` · ${job.city}` : ""}
      </p>
      <div className="mt-8 space-y-2 text-[14px] text-[#6e6e73]">
        {job.experience ? <p>经验：{job.experience}</p> : null}
        {job.education ? <p>学历：{job.education}</p> : null}
        {job.salaryMin != null || job.salaryMax != null ? (
          <p>
            薪资：
            {job.salaryMin != null ? `${job.salaryMin}` : "—"} —{" "}
            {job.salaryMax != null ? `${job.salaryMax}` : "—"}（K/月 · 示意）
          </p>
        ) : null}
      </div>
      <section className="mt-10">
        <h2 className="text-[1.05rem] font-semibold text-[#1d1d1f]">职位描述</h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#424245]">{job.description}</p>
      </section>
      {job.requirements ? (
        <section className="mt-8">
          <h2 className="text-[1.05rem] font-semibold text-[#1d1d1f]">任职要求</h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#424245]">{job.requirements}</p>
        </section>
      ) : null}
      <p className="mt-12 rounded-xl border border-black/[0.06] bg-[#f5f5f7] p-4 text-[13px] leading-relaxed text-[#6e6e73]">
        投递入口（简历上传、邮件通知）可在后续迭代中对接企业后台与通知服务。
      </p>
    </div>
  );
}
