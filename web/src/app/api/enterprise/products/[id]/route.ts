import { NextRequest } from "next/server";
import { z } from "zod";
import { getEnterpriseFromRequest, unauthorized, ok, badRequest, notFound } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const updateProductSchema = z.object({
  name: z.string().min(1, "产品名称不能为空").max(200).optional(),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  parameters: z.any().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  datasheetUrl: z.string().url("数据手册链接格式不正确").optional().nullable().or(z.literal("")),
  sort: z.number().int().min(0).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const product = await prisma.product.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!product) return notFound("Product");

  return ok(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const existing = await prisma.product.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!existing) return notFound("Product");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateProductSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updateData[key] = value ?? null;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return ok(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const existing = await prisma.product.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!existing) return notFound("Product");

  await prisma.product.delete({ where: { id } });
  return ok({ deleted: true });
}
