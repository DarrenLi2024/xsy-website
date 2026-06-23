import { NextRequest } from "next/server";
import { z } from "zod";
import { JobStatus, JobType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, badRequest } from "@/lib/admin-api";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "";
  const status = url.searchParams.get("status") || "";
  const city = url.searchParams.get("city") || "";

  const where: Prisma.JobWhereInput = {};
  if (type && (Object.values(JobType) as string[]).includes(type)) {
    where.type = type as JobType;
  }
  if (status && (Object.values(JobStatus) as string[]).includes(status)) {
    where.status = status as JobStatus;
  }
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: { select: { id: true, name: true, slug: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  title: z.string().min(1, "职位名称不能为空"),
  companyId: z.string().min(1, "请选择企业"),
  city: z.string().optional().default(""),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]),
  experience: z.string().optional().default(""),
  education: z.string().optional().default(""),
  salaryMin: z.number().int().optional().nullable().default(null),
  salaryMax: z.number().int().optional().nullable().default(null),
  description: z.string().min(1, "职位描述不能为空"),
  requirements: z.string().optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional().default("PUBLISHED"),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const job = await prisma.job.create({
    data: {
      title: data.title,
      companyId: data.companyId,
      city: data.city || null,
      type: data.type,
      experience: data.experience || null,
      education: data.education || null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      description: data.description,
      requirements: data.requirements || null,
      status: data.status,
    },
  });

  return created(job);
}
