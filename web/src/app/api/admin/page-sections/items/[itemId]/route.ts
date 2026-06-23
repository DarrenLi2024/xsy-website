import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.pageSectionItem.findUnique({
    where: { id: itemId },
    include: { section: { select: { id: true, title: true, code: true, type: true } } },
  });
  if (!item) return notFound("PageSectionItem");

  return ok(item);
}

const updateSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  sort: z.number().int().optional(),
  active: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  extra: z.any().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { itemId } = await params;
  const existing = await prisma.pageSectionItem.findUnique({ where: { id: itemId } });
  if (!existing) return notFound("PageSectionItem");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title || null;
  if (parsed.data.subtitle !== undefined) data.subtitle = parsed.data.subtitle || null;
  if (parsed.data.description !== undefined) data.description = parsed.data.description || null;
  if (parsed.data.image !== undefined) data.image = parsed.data.image || null;
  if (parsed.data.link !== undefined) data.link = parsed.data.link || null;
  if (parsed.data.linkText !== undefined) data.linkText = parsed.data.linkText || null;
  if (parsed.data.sort !== undefined) data.sort = parsed.data.sort;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.startDate !== undefined) data.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  if (parsed.data.endDate !== undefined) data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
  if (parsed.data.extra !== undefined) data.extra = parsed.data.extra;

  const item = await prisma.pageSectionItem.update({
    where: { id: itemId },
    data,
  });

  return ok(item);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { itemId } = await params;
  const existing = await prisma.pageSectionItem.findUnique({ where: { id: itemId } });
  if (!existing) return notFound("PageSectionItem");

  await prisma.pageSectionItem.delete({ where: { id: itemId } });

  return ok({ deleted: true });
}
