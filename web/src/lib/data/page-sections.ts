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

const sectionInclude = {
  items: {
    where: { active: true },
    orderBy: { sort: "asc" as const },
  },
} as const;

export async function getPublicPageSection(code: PublicSectionCode) {
  try {
    const section = await prisma.pageSection.findUnique({
      where: { code },
      include: sectionInclude,
    });
    // 只返回 active 的板块（管理员可在后台控制开关）
    if (!section?.active) return null;
    return section;
  } catch {
    return null;
  }
}

/** 一次查询拉取多个首页板块，减少 Supabase 往返次数 */
export async function getActivePublicPageSectionsMap(
  codes: readonly PublicSectionCode[],
) {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { code: { in: [...codes] }, active: true },
      include: sectionInclude,
    });
    return new Map(sections.map((section) => [section.code as PublicSectionCode, section]));
  } catch {
    return new Map<PublicSectionCode, never>();
  }
}

export type PublicPageSectionPayload = Awaited<ReturnType<typeof getPublicPageSection>>;
