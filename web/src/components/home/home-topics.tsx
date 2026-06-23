import Link from "next/link";
import Image from "next/image";
import {
  CardRoot,
  CardBody,
  CardTitle,
  CardCta,
} from "@/components/ui/card";
import type { PublicPageSectionPayload } from "@/lib/data/page-sections";

type Props = {
  items: NonNullable<PublicPageSectionPayload>["items"];
};

export function HomeTopics({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      id="section-topics"
      className="scroll-mt-32 border-t border-black/[0.06] bg-[#f5f5f7] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
          Topics
        </p>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
          专题
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#6e6e73]">
          以主题为线索聚合报道，便于在复杂产业链中快速定位关键议题。
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => {
            const title = t.title ?? "";
            const hasImage = !!(t.image);
            return (
              <Link key={t.id} href={t.link || "/articles"} className="group block">
                <CardRoot className="overflow-hidden bg-white p-0">
                  {hasImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#e8e8ed]">
                      <Image
                        src={t.image!}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <CardBody className="p-5">
                    <CardTitle>{title}</CardTitle>
                    {t.description ? (
                      <p className="mt-2 text-[13px] leading-relaxed text-[#6e6e73]">
                        {t.description}
                      </p>
                    ) : null}
                    <CardCta className="mt-4">{t.linkText || "查看"}</CardCta>
                  </CardBody>
                </CardRoot>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
