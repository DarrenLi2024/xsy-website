import { NextRequest } from "next/server";
import { z } from "zod";
import { SectionType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "page:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const type = url.searchParams.get("type") || "";
  const q = url.searchParams.get("q") || "";

  const where: Prisma.PageSectionWhereInput = {};
  if (type && (Object.values(SectionType) as string[]).includes(type)) {
    where.type = type as SectionType;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.pageSection.findMany({
      where,
      orderBy: { sort: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.pageSection.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  type: z.enum(["HERO_SLIDE", "TOPIC_CARD", "TESTIMONIAL", "NAV_LINK", "FOOTER_COLUMN", "CTA_SECTION", "TRENDING", "ARTICLES_FEED", "COMPANIES", "EVENTS", "REPORTS", "AWARDS"]),
  code: z.string().min(1),
  title: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
  sort: z.number().int().optional().default(0),
  settings: z.object({}).passthrough().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "page:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const section = await prisma.pageSection.create({
    data: {
      type: data.type,
      code: data.code,
      title: data.title || null,
      active: data.active,
      sort: data.sort,
      settings: data.settings as Prisma.InputJsonValue,
    },
  });

  return created(section);
}
