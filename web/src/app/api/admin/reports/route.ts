import { NextRequest } from "next/server";
import { z } from "zod";
import { ReportCategory, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "report:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";

  const where: Prisma.ReportWhereInput = {};
  if (category && (Object.values(ReportCategory) as string[]).includes(category)) {
    where.category = category as ReportCategory;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.report.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  fileUrl: z.string().optional().default(""),
  price: z.number().optional().nullable().default(null),
  category: z
    .enum(["INDUSTRY_TREND", "MARKET_ANALYSIS", "TECHNOLOGY_REVIEW", "COMPANY_PROFILE", "CUSTOM_REPORT"])
    .optional()
    .default("INDUSTRY_TREND"),
  tags: z.array(z.string()).optional().default([]),
  publishedAt: z.string().optional().nullable().default(null),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "report:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const report = await prisma.report.create({
    data: {
      title: data.title,
      description: data.description || null,
      coverImage: data.coverImage || null,
      fileUrl: data.fileUrl || null,
      price: data.price ?? null,
      category: data.category,
      tags: data.tags,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  });

  return created(report);
}
