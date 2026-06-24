import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, notFound, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "event:read"); } catch { return forbidden(); }
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });
  if (!event) return notFound("Event");
  return ok(event);
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["EXHIBITION", "CONFERENCE", "WEBINAR", "SALON", "WORKSHOP"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  coverImage: z.string().optional(),
  capacity: z.number().int().optional().nullable(),
  registrationDeadline: z.string().optional().nullable(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  isFeatured: z.boolean().optional(),
  companyId: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return notFound("Event");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.registrationDeadline !== undefined) {
    updateData.registrationDeadline = data.registrationDeadline
      ? new Date(data.registrationDeadline)
      : null;
  }
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.location !== undefined) updateData.location = data.location || null;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
  if (data.companyId !== undefined) updateData.companyId = data.companyId || null;

  const event = await prisma.event.update({
    where: { id },
    data: updateData as Prisma.EventUpdateInput,
  });

  return ok(event);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "event:write"); } catch { return forbidden(); }
  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return notFound("Event");

  await prisma.event.delete({ where: { id } });
  return ok({ deleted: true });
}
