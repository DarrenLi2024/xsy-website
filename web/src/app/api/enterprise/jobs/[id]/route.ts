import { NextRequest } from "next/server";
import { z } from "zod";
import { getEnterpriseFromRequest, unauthorized, ok, badRequest, notFound } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const updateJobSchema = z.object({
  title: z.string().min(1, "职位名称不能为空").max(200).optional(),
  city: z.string().max(100).optional().nullable(),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]).optional(),
  experience: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  salaryMin: z.coerce.number().int().min(0).optional().nullable(),
  salaryMax: z.coerce.number().int().min(0).optional().nullable(),
  description: z.string().max(10000).optional(),
  requirements: z.string().max(10000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const job = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
    include: { _count: { select: { applications: true } } },
  });
  if (!job) return notFound("Job");

  return ok(job);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const existing = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!existing) return notFound("Job");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateJobSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updateData[key] = value ?? null;
  }

  const job = await prisma.job.update({
    where: { id },
    data: updateData,
  });

  return ok(job);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const existing = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!existing) return notFound("Job");

  await prisma.job.update({ where: { id }, data: { status: "CLOSED" } });
  return ok({ closed: true });
}
