import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound, badRequest } from "@/lib/admin-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const channel = await prisma.mediaChannel.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!channel) return notFound("MediaChannel");
  return ok(channel);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["WECHAT_MP", "TOUTIAO", "ZHIHU", "WEIBO", "LINKEDIN", "BILIBILI"]).optional(),
  url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.mediaChannel.findUnique({ where: { id } });
  if (!existing) return notFound("MediaChannel");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const channel = await prisma.mediaChannel.update({
    where: { id },
    data: parsed.data,
  });
  return ok(channel);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const existing = await prisma.mediaChannel.findUnique({ where: { id } });
  if (!existing) return notFound("MediaChannel");

  await prisma.mediaChannel.delete({ where: { id } });
  return ok({ deleted: true });
}
