import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateZh } from "@/lib/format-date";
import { safeQuery } from "@/lib/data/safe-query";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const e = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: e?.title ?? "活动" };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await safeQuery(
    () =>
      prisma.event.findUnique({
        where: { id },
        include: { company: { select: { name: true, slug: true } } },
      }),
    null,
    "EventDetailPage",
  );
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20 lg:px-10">
      <Link href="/events" className="text-[13px] font-medium text-[var(--accent)] transition hover:opacity-75">
        ← 活动列表
      </Link>
      <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
        {event.title}
      </h1>
      <div className="mt-6 space-y-3 text-[15px] text-[#6e6e73]">
        <p className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-[#86868b]" />
          {formatDateZh(event.startDate)} — {formatDateZh(event.endDate)}
        </p>
        {event.location ? (
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#86868b]" />
            {event.location}
          </p>
        ) : null}
        {event.company ? (
          <p>
            主办：
            <Link
              href={`/companies/${event.company.slug}`}
              className="font-medium text-[var(--accent)] transition hover:opacity-75"
            >
              {event.company.name}
            </Link>
          </p>
        ) : null}
      </div>
      {event.coverImage ? (
        <div className="relative mt-10 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-[#f5f5f7]">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 720px"
            priority
          />
        </div>
      ) : null}
      {event.description ? (
        <p className="mt-8 text-[15px] leading-[1.65] text-[#424245]">{event.description}</p>
      ) : null}
      <p className="mt-10 text-[13px] text-[#86868b]">
        报名与直播能力可在后续版本接入表单与第三方嵌入。
      </p>
    </div>
  );
}
