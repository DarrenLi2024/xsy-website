import { NextRequest } from "next/server";
import { z } from "zod";
import { CompanyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAdminFromRequest,
  unauthorized,
  forbidden,
  ok,
  notFound,
  badRequest,
} from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";
import { invalidatePublicContentCaches } from "@/lib/revalidate";

const statusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
  reason: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "company:review"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return notFound("Company");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = statusSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { status, reason } = parsed.data;

  const company = await prisma.company.update({
    where: { id },
    data: { status: status as CompanyStatus },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userEmail: admin.email,
      action: `${status}_COMPANY`,
      resource: "Company",
      resourceId: id,
      detail: {
        companyName: company.name,
        reason: reason || null,
        previousStatus: existing.status,
      },
    },
  });

  invalidatePublicContentCaches();
  return ok({ ...company, status });
}
