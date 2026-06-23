import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const section = await prisma.pageSection.findUnique({ where: { id } });
  if (!section) return notFound("PageSection");

  const updated = await prisma.pageSection.update({
    where: { id },
    data: { active: !section.active },
  });

  return ok({ id: updated.id, active: updated.active });
}
