import Image from "next/image";
import type { PublicPageSectionPayload } from "@/lib/data/page-sections";

type Props = {
  items: NonNullable<PublicPageSectionPayload>["items"];
};

export function HomeProof({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="section-proof" className="scroll-mt-32 bg-[#fbfbfd] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
          Voices
        </p>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
          声音
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((q) => (
            <figure
              key={q.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              {q.image ? (
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#e8e8ed]">
                    <Image
                      src={q.image}
                      alt={q.subtitle || ""}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1d1d1f]">
                      {q.subtitle || "产业专家"}
                    </p>
                  </div>
                </div>
              ) : null}
              <blockquote className="text-[16px] font-normal leading-relaxed tracking-tight text-[#1d1d1f] md:text-[17px]">
                「{q.title}」
              </blockquote>
              {!q.image && (
                <figcaption className="mt-6 text-[12px] leading-relaxed text-[#86868b]">—— {q.subtitle}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
