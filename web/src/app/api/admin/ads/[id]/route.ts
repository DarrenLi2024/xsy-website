import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, notFound, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:read"); } catch { return forbidden(); }

  const { id } = await params;
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: { slot: { select: { id: true, title: true, code: true } } },
  });
  if (!ad) return notFound("Ad");

  return ok(ad);
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  image: z.string().optional().nullable(),
  link: z.string().min(1).optional(),
  sort: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.ad.findUnique({ where: { id } });
  if (!existing) return notFound("Ad");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.image !== undefined) data.image = parsed.data.image || null;
  if (parsed.data.link !== undefined) data.link = parsed.data.link;
  if (parsed.data.sort !== undefined) data.sort = parsed.data.sort;
  if (parsed.data.startDate !== undefined) data.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate !== undefined) data.endDate = new Date(parsed.data.endDate);
  if (parsed.data.active !== undefined) data.active = parsed.data.active;

  const ad = await prisma.ad.update({
    where: { id },
    data,
  });

  return ok(ad);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.ad.findUnique({ where: { id } });
  if (!existing) return notFound("Ad");

  await prisma.ad.delete({ where: { id } });

  return ok({ deleted: true });
}
