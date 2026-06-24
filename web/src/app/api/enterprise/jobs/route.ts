import { NextRequest } from "next/server";
import { z } from "zod";
import { getEnterpriseFromRequest, unauthorized, ok, created, badRequest } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

const createJobSchema = z.object({
  title: z.string().min(1, "职位名称不能为空").max(200),
  city: z.string().max(100).optional().nullable(),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"], {
    message: "请选择职位类型",
  }),
  experience: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  salaryMin: z.coerce.number().int().min(0).optional().nullable(),
  salaryMax: z.coerce.number().int().min(0).optional().nullable(),
  description: z.string().min(1, "职位描述不能为空").max(10000),
  requirements: z.string().max(10000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional().default("PUBLISHED"),
});

export async function GET(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const status = url.searchParams.get("status") || "";

  const where: Record<string, unknown> = { companyId: user.companyId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}

export async function POST(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createJobSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const job = await prisma.job.create({
    data: {
      companyId: user.companyId,
      title: parsed.data.title,
      city: parsed.data.city || null,
      type: parsed.data.type,
      experience: parsed.data.experience || null,
      education: parsed.data.education || null,
      salaryMin: parsed.data.salaryMin ?? null,
      salaryMax: parsed.data.salaryMax ?? null,
      description: parsed.data.description,
      requirements: parsed.data.requirements || null,
      status: parsed.data.status,
    },
  });

  return created(job);
}
