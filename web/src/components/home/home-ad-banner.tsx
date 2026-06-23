import Link from "next/link";
import Image from "next/image";
import type { HomePagePayload } from "@/lib/data/home";

type Props = {
  ad: HomePagePayload["ad"];
};

export function HomeAdBanner({ ad }: Props) {
  if (!ad) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
      <Link
        href={ad.link}
        className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:flex-row md:items-stretch"
      >
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
            Sponsor
          </p>
          <p className="mt-2 text-[19px] font-semibold tracking-tight text-[#1d1d1f]">{ad.title}</p>
          <span className="mt-4 inline-flex text-[14px] font-medium text-[var(--accent)] transition group-hover:opacity-75">
            了解更多
          </span>
        </div>
        {ad.image ? (
          <div className="relative h-44 w-full shrink-0 border-t border-black/[0.06] md:h-auto md:w-[42%] md:border-l md:border-t-0">
            <Image
              src={ad.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 40vw"
            />
          </div>
        ) : null}
      </Link>
    </div>
  );
}
