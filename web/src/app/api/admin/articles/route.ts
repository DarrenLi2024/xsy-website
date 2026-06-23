import { NextRequest } from "next/server";
import { z } from "zod";
import { ArticleStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, badRequest } from "@/lib/admin-api";
import { invalidatePublicContentCaches } from "@/lib/revalidate";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") || "";
  const category = url.searchParams.get("category") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";

  const where: Prisma.ArticleWhereInput = { deletedAt: null };
  if (status && (Object.values(ArticleStatus) as string[]).includes(status)) {
    where.status = status as ArticleStatus;
  }
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { company: { select: { name: true, slug: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional().default(""),
  content: z.string().default(""),
  coverImage: z.string().optional().default(""),
  category: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  author: z.string().optional().default(""),
  source: z.string().optional().default(""),
  companyId: z.string().optional().nullable().default(null),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  publishedAt: z.string().optional().nullable().default(null),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : data.status === "PUBLISHED" ? new Date() : null;

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage || null,
      category: data.category || null,
      tags: data.tags,
      author: data.author || null,
      source: data.source || null,
      companyId: data.companyId || null,
      isFeatured: data.isFeatured,
      status: data.status,
      publishedAt,
    },
  });

  invalidatePublicContentCaches();
  return created(article);
}
