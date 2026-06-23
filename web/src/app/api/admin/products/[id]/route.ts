import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });

  if (!product) return notFound("Product");
  return ok(product);
}

const updateSchema = z.object({
  companyId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional(),
  sort: z.number().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data as Prisma.ProductUpdateInput,
  });

  return ok(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product");

  await prisma.product.delete({ where: { id } });

  return ok({ deleted: true });
}
