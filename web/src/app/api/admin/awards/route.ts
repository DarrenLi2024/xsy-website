import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";
import { getAdminAwardYears } from "@/lib/data/admin-awards";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "award:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const active = url.searchParams.get("active");
  const year = url.searchParams.get("year");

  const where: Prisma.AwardCampaignWhereInput = {};
  if (active === "true") where.active = true;
  if (active === "false") where.active = false;
  if (year) where.year = parseInt(year);
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total, years] = await Promise.all([
    prisma.awardCampaign.findMany({
      where,
      orderBy: { year: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.awardCampaign.count({ where }),
    getAdminAwardYears(),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    years,
  });
}

const createSchema = z.object({
  slug: z.string().min(1, "Slug 不能为空"),
  title: z.string().min(1, "标题不能为空"),
  summary: z.string().optional().default(""),
  year: z.number().int().min(2000).max(2100),
  startDate: z.string().min(1, "开始时间不能为空"),
  endDate: z.string().min(1, "结束时间不能为空"),
  active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "award:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;

  // Check slug uniqueness
  const existing = await prisma.awardCampaign.findUnique({
    where: { slug: data.slug },
  });
  if (existing) return badRequest("Slug 已存在");

  const award = await prisma.awardCampaign.create({
    data: {
      slug: data.slug,
      title: data.title,
      summary: data.summary || null,
      year: data.year,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: data.active,
    },
  });

  return created(award);
}
