import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const slot = await prisma.adSlot.findUnique({
    where: { id },
    include: { _count: { select: { ads: true } } },
  });
  if (!slot) return notFound("AdSlot");

  return ok(slot);
}

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.adSlot.findUnique({ where: { id } });
  if (!existing) return notFound("AdSlot");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  if (parsed.data.code && parsed.data.code !== existing.code) {
    const duplicate = await prisma.adSlot.findUnique({ where: { code: parsed.data.code } });
    if (duplicate) return badRequest("Slot code already exists");
  }

  const slot = await prisma.adSlot.update({
    where: { id },
    data: parsed.data,
  });

  return ok(slot);
}
