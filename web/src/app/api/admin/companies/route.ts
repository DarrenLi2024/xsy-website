import { NextRequest } from "next/server";
import { z } from "zod";
import { CompanyStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "company:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") || "";
  const industry = url.searchParams.get("industry") || "";

  const where: Prisma.CompanyWhereInput = { deletedAt: null };
  if (status && (Object.values(CompanyStatus) as string[]).includes(status)) {
    where.status = status as CompanyStatus;
  }
  if (industry) where.industry = industry;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { products: true } } },
    }),
    prisma.company.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  name: z.string().min(1, "企业名称不能为空"),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  scale: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional().default("PENDING"),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "company:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  let slug = slugify(data.name);

  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  // Check name uniqueness
  const nameConflict = await prisma.company.findFirst({
    where: { name: data.name, deletedAt: null },
  });
  if (nameConflict) return badRequest("企业名称已存在");

  const company = await prisma.company.create({
    data: {
      name: data.name,
      slug,
      logo: data.logo || null,
      description: data.description || null,
      website: data.website || null,
      industry: data.industry || null,
      scale: data.scale || null,
      city: data.city || null,
      status: data.status,
    },
  });

  return created(company);
}
