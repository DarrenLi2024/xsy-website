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
  try { checkPermitOrDeny(admin, "company:read"); } catch { return forbidden(); }

  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!company || company.deletedAt) return notFound("Company");
  return ok(company);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  scale: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "company:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return notFound("Company");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const updateData: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.name && parsed.data.name !== existing.name) {
    // Check name uniqueness
    const nameConflict = await prisma.company.findFirst({
      where: { name: parsed.data.name, deletedAt: null, id: { not: id } },
    });
    if (nameConflict) return badRequest("企业名称已存在");

    let slug = parsed.data.name
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const conflict = await prisma.company.findFirst({
      where: { slug, id: { not: id } },
    });
    if (conflict) {
      slug = `${slug}-${Date.now()}`;
    }
    updateData.slug = slug;
  }

  const company = await prisma.company.update({
    where: { id },
    data: updateData as Prisma.CompanyUpdateInput,
  });

  return ok(company);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "company:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return notFound("Company");

  await prisma.company.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return ok({ deleted: true });
}
