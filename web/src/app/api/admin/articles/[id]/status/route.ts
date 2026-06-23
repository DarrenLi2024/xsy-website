import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

const schema = z.object({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  const { id } = await params;

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");
  const parsed = schema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return notFound("Article");

  const data: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "PUBLISHED" && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const article = await prisma.article.update({ where: { id }, data });
  return ok(article);
}
