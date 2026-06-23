import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnterpriseFromRequest, unauthorized, ok, badRequest, notFound } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const urlSchema = z.string().url().optional().nullable().or(z.literal(""));

const updateCompanySchema = z.object({
  logo: z.string().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  website: urlSchema,
  industry: z.string().max(100).optional().nullable(),
  scale: z.string().max(50).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      website: true,
      industry: true,
      scale: true,
      city: true,
      socialLinks: true,
      status: true,
      createdAt: true,
    },
  });

  if (!company) return notFound("Company");
  return ok(company);
}

export async function PUT(req: Request) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateCompanySchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updateData[key] = value ?? null;
  }

  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: updateData,
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      website: true,
      industry: true,
      scale: true,
      city: true,
      socialLinks: true,
      status: true,
    },
  });

  return ok(company);
}
