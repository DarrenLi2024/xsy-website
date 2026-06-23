import Link from "next/link";
import Image from "next/image";
import {
  CardRoot,
  CardIcon,
  CardBody,
  CardTitle,
  CardCta,
  CardShine,
} from "@/components/ui/card";
import type { HomePagePayload } from "@/lib/data/home";
import { Building2 } from "lucide-react";

type Props = {
  companies: HomePagePayload["companies"];
};

export function HomeCompanies({ companies }: Props) {
  if (companies.length === 0) return null;
  return (
    <section id="section-companies" className="scroll-mt-32 bg-[#fbfbfd] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
              Directory
            </p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#1d1d1f] md:text-[2.25rem]">
              企业
            </h2>
          </div>
          <Link
            href="/companies"
            className="shrink-0 text-[15px] font-medium text-[var(--accent)] transition duration-200 hover:opacity-75"
          >
            全部企业
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((c) => (
            <Link key={c.slug} href={`/companies/${c.slug}`}>
              <CardRoot variant="glow" className="bg-white">
                <CardShine />
                <CardBody>
                  <CardIcon>
                    {c.logo ? (
                      <Image
                        src={c.logo}
                        alt=""
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-[#424245]" strokeWidth={1.5} />
                    )}
                  </CardIcon>
                  <CardTitle className="mt-4">{c.name}</CardTitle>
                  <p className="mt-1 text-[12px] text-[#86868b] transition-colors duration-300 group-hover:text-[var(--accent)]/70">
                    {[c.industry, c.city].filter(Boolean).join(" · ")}
                  </p>
                  {c.description ? (
                    <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#6e6e73]">
                      {c.description}
                    </p>
                  ) : null}
                  <CardCta className="mt-4">查看主页</CardCta>
                </CardBody>
              </CardRoot>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
