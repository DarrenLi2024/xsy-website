import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { formatDateZh } from "@/lib/format-date";
import {
  CardRoot,
  CardImage,
  CardTag,
  CardBody,
  CardTitle,
  CardCta,
} from "@/components/ui/card";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  events: HomePagePayload["events"];
};

const typeLabels: Record<string, string> = {
  EXHIBITION: "展会",
  CONFERENCE: "峰会",
  WEBINAR: "线上",
  SALON: "沙龙",
  WORKSHOP: "培训",
};

export function HomeEvents({ events }: Props) {
  if (events.length === 0) return null;
  return (
    <section
      id="section-events"
      className="scroll-mt-32 border-t border-black/[0.06] bg-[#f5f5f7] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
              Events
            </p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
              活动
            </h2>
          </div>
          <Link
            href="/events"
            className="shrink-0 text-[15px] font-medium text-[var(--accent)] transition duration-200 hover:opacity-75"
          >
            活动日历
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`}>
              <CardRoot className="bg-white">
                  {e.coverImage ? (
                    <CardImage>
                      <div className="relative aspect-[16/9] w-full bg-[#f5f5f7]">
                        <Image
                          src={e.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:1024px) 50vw, 33vw"
                        />
                      </div>
                    </CardImage>
                  ) : (
                    /* 无封面时显示纯色占位 + 类型标签悬浮 */
                    <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#e8e8ed] to-[#f5f5f7]">
                      <Calendar className="h-10 w-10 text-[#86868b]/40" strokeWidth={1} />
                    </div>
                  )}
                  <CardBody>
                    <CardTag>{typeLabels[e.type] ?? e.type}</CardTag>
                    <CardTitle className="mt-3 line-clamp-2">{e.title}</CardTitle>
                    <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#6e6e73] transition-colors duration-300 group-hover:text-[var(--accent)]/70">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {formatDateZh(e.startDate)}
                      </span>
                      {e.location ? (
                        <span className="inline-flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                          <span className="line-clamp-2">{e.location}</span>
                        </span>
                      ) : null}
                    </div>
                    <CardCta className="mt-4">了解详情</CardCta>
                  </CardBody>
                </CardRoot>
              </Link>
            ))
          }
        </div>
      </div>
    </section>
  );
}
