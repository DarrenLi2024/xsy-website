import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnterpriseFromRequest, enterpriseUnauthorized, ok, badRequest } from "@/lib/enterprise-api";

export async function GET(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return enterpriseUnauthorized();

  const items = await prisma.softArticle.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      channels: { include: { channel: true } },
      _count: { select: { metrics: true } },
    },
  });

  return ok({ items, total: items.length });
}

const createSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(1, "内容不能为空"),
  summary: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  author: z.string().optional(),
  seoKeywords: z.string().optional(),
  channelIds: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return enterpriseUnauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const { channelIds, ...data } = parsed.data;

  const article = await prisma.softArticle.create({
    data: {
      ...data,
      companyId: user.companyId,
      status: "PENDING_REVIEW",
      channels: channelIds.length > 0 ? {
        create: channelIds.map((channelId) => ({ channelId })),
      } : undefined,
    },
    include: { channels: { include: { channel: true } } },
  });

  return ok(article);
}
