import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, include: { company: true } });
  if (!article || article.deletedAt) return notFound("Article");
  return ok(article);
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  source: z.string().optional(),
  companyId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return notFound("Article");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.publishedAt !== undefined) {
    updateData.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateData as Prisma.ArticleUpdateInput,
  });

  return ok(article);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return notFound("Article");

  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return ok({ deleted: true });
}
