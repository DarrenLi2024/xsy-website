import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { getPublicEventsList } from "@/lib/data/public-lists";
import { formatDateZh } from "@/lib/format-date";
import { safeQuery } from "@/lib/data/safe-query";

export const metadata: Metadata = {
  title: "活动",
  description: "峰会、沙龙与线上活动。",
};

export const revalidate = 60;

const typeLabels: Record<string, string> = {
  EXHIBITION: "展会", CONFERENCE: "峰会", WEBINAR: "线上", SALON: "沙龙", WORKSHOP: "培训",
};

export default async function EventsPage() {
  const events = await safeQuery(() => getPublicEventsList(), [], "EventsPage");

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20 lg:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Events</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.5rem]">活动</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6e6e73]">近期与进行中的产业活动。</p>
      {events.length === 0 ? (
        <p className="mt-12 text-[15px] text-[#6e6e73]">暂无进行中的活动。</p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                {e.coverImage ? (
                  <div className="relative aspect-[16/9] w-full bg-[#f5f5f7]">
                    <Image src={e.coverImage} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100" sizes="(max-width:768px) 100vw, 50vw" />
                  </div>
                ) : <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]" />}
                <div className="flex flex-col p-6">
                  <span className="w-fit rounded-full border border-black/[0.06] bg-[#f5f5f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]">{typeLabels[e.type] ?? e.type}</span>
                  <h2 className="mt-3 text-[1.25rem] font-semibold tracking-tight text-[#1d1d1f]">{e.title}</h2>
                  <div className="mt-4 flex flex-col gap-2 text-[14px] text-[#6e6e73]">
                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0 text-[#86868b]" />{formatDateZh(e.startDate)}</span>
                    {e.location ? <span className="inline-flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#86868b]" /><span className="line-clamp-2">{e.location}</span></span> : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
