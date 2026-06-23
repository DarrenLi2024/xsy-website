import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const items = await prisma.mediaChannel.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  });

  return ok({ items, total: items.length });
}

const createSchema = z.object({
  name: z.string().min(1, "渠道名称不能为空"),
  type: z.enum(["WECHAT_MP", "TOUTIAO", "ZHIHU", "WEIBO", "LINKEDIN", "BILIBILI"]).optional().default("WECHAT_MP"),
  url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const channel = await prisma.mediaChannel.create({
    data: parsed.data as Parameters<typeof prisma.mediaChannel.create>[0]["data"],
  });
  return created(channel);
}
