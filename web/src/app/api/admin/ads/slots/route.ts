import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "ad:read"); } catch { return forbidden(); }

  const slots = await prisma.adSlot.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { ads: true } } },
  });

  return ok(slots);
}

const createSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
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

  const existing = await prisma.adSlot.findUnique({ where: { code: parsed.data.code } });
  if (existing) return badRequest("Slot code already exists");

  const slot = await prisma.adSlot.create({ data: parsed.data });

  return created(slot);
}
