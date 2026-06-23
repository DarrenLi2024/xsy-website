import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const section = await prisma.pageSection.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sort: "asc" } },
      _count: { select: { items: true } },
    },
  });
  if (!section) return notFound("PageSection");

  return ok(section);
}

const updateSchema = z.object({
  type: z.enum(["HERO_SLIDE", "TOPIC_CARD", "TESTIMONIAL", "NAV_LINK", "FOOTER_COLUMN", "CTA_SECTION", "TRENDING", "ARTICLES_FEED", "COMPANIES", "EVENTS", "REPORTS", "AWARDS"]).optional(),
  code: z.string().min(1).optional(),
  title: z.string().optional().nullable(),
  active: z.boolean().optional(),
  sort: z.number().int().optional(),
  settings: z.any().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) return notFound("PageSection");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data: Record<string, unknown> = {};
  if (parsed.data.type !== undefined) data.type = parsed.data.type;
  if (parsed.data.code !== undefined) data.code = parsed.data.code;
  if (parsed.data.title !== undefined) data.title = parsed.data.title || null;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.sort !== undefined) data.sort = parsed.data.sort;
  if (parsed.data.settings !== undefined) data.settings = parsed.data.settings;

  const section = await prisma.pageSection.update({
    where: { id },
    data,
  });

  return ok(section);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) return notFound("PageSection");

  await prisma.pageSection.delete({ where: { id } });

  return ok({ deleted: true });
}
