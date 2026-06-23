import { prisma } from "@/lib/prisma";

export const PUBLIC_SECTION_CODES = [
  "main-nav",
  "hero",
  "trending",
  "articles-feed",
  "companies",
  "events",
  "reports",
  "awards",
  "topics",
  "testimonials",
  "cta",
  "footer",
] as const;

export type PublicSectionCode = (typeof PUBLIC_SECTION_CODES)[number];

export async function getPublicPageSection(code: PublicSectionCode) {
  try {
    const section = await prisma.pageSection.findUnique({
      where: { code },
      include: {
        items: {
          where: { active: true },
          orderBy: { sort: "asc" },
        },
      },
    });
    // 只返回 active 的板块（管理员可在后台控制开关）
    if (!section?.active) return null;
    return section;
  } catch {
    return null;
  }
}

export type PublicPageSectionPayload = Awaited<ReturnType<typeof getPublicPageSection>>;
