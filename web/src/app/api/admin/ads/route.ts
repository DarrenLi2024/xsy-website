import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const slotId = url.searchParams.get("slotId") || "";

  const where: Prisma.AdWhereInput = {};
  if (slotId) where.slotId = slotId;

  const [items, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      orderBy: { sort: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { slot: { select: { id: true, title: true, code: true } } },
    }),
    prisma.ad.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  slotId: z.string().min(1),
  title: z.string().min(1),
  image: z.string().optional().default(""),
  link: z.string().min(1),
  sort: z.number().int().optional().default(0),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const slot = await prisma.adSlot.findUnique({ where: { id: parsed.data.slotId } });
  if (!slot) return badRequest("AdSlot not found");

  const ad = await prisma.ad.create({
    data: {
      slotId: parsed.data.slotId,
      title: parsed.data.title,
      image: parsed.data.image || null,
      link: parsed.data.link,
      sort: parsed.data.sort,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      active: parsed.data.active,
    },
  });

  return created(ad);
}
