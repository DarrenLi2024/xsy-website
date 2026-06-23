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
  const award = await prisma.awardCampaign.findUnique({ where: { id } });
  if (!award) return notFound("AwardCampaign");
  return ok(award);
}

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.awardCampaign.findUnique({ where: { id } });
  if (!existing) return notFound("AwardCampaign");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await prisma.awardCampaign.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) return badRequest("Slug 已存在");
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.summary !== undefined) updateData.summary = data.summary || null;

  const award = await prisma.awardCampaign.update({
    where: { id },
    data: updateData as Prisma.AwardCampaignUpdateInput,
  });

  return ok(award);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.awardCampaign.findUnique({ where: { id } });
  if (!existing) return notFound("AwardCampaign");

  await prisma.awardCampaign.delete({ where: { id } });
  return ok({ deleted: true });
}
