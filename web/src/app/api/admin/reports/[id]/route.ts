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
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return notFound("Report");
  return ok(report);
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  price: z.number().optional().nullable(),
  category: z
    .enum(["INDUSTRY_TREND", "MARKET_ANALYSIS", "TECHNOLOGY_REVIEW", "COMPANY_PROFILE", "CUSTOM_REPORT"])
    .optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) return notFound("Report");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
  if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl || null;
  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }

  const report = await prisma.report.update({
    where: { id },
    data: updateData as Prisma.ReportUpdateInput,
  });

  return ok(report);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) return notFound("Report");

  await prisma.report.delete({ where: { id } });
  return ok({ deleted: true });
}
