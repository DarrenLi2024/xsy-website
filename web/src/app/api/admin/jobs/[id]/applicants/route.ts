import { NextRequest } from "next/server";
import { z } from "zod";
import { ApplicationStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

const PAGE_SIZE = 50;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, select: { id: true } });
  if (!job) return notFound("Job");

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const status = url.searchParams.get("status") || "";

  const where: Prisma.JobApplicationWhereInput = { jobId: id };
  if (status && (Object.values(ApplicationStatus) as string[]).includes(status)) {
    where.status = status as ApplicationStatus;
  }

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "INTERVIEWING", "ACCEPTED", "REJECTED"]),
});

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const applicationId = url.searchParams.get("applicationId");
  if (!applicationId) return badRequest("applicationId is required");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateStatusSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
  });
  if (!existing) return notFound("Application");

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: parsed.data.status },
  });

  return ok(updated);
}
