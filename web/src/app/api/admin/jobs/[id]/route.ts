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
  try { checkPermitOrDeny(admin, "job:read"); } catch { return forbidden(); }
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });
  if (!job) return notFound("Job");
  return ok(job);
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  companyId: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  salaryMin: z.number().int().optional().nullable(),
  salaryMax: z.number().int().optional().nullable(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return notFound("Job");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.city !== undefined) updateData.city = data.city || null;
  if (data.experience !== undefined) updateData.experience = data.experience || null;
  if (data.education !== undefined) updateData.education = data.education || null;
  if (data.requirements !== undefined) updateData.requirements = data.requirements || null;

  const job = await prisma.job.update({
    where: { id },
    data: updateData as Prisma.JobUpdateInput,
  });

  return ok(job);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "job:write"); } catch { return forbidden(); }
  const { id } = await params;

  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return notFound("Job");

  await prisma.job.delete({ where: { id } });
  return ok({ deleted: true });
}
